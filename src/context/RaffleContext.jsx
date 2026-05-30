import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseConfig';
import { notificationService } from '../services/notificationService';

const RaffleContext = createContext();

export const useRaffle = () => useContext(RaffleContext);

export const RaffleProvider = ({ children }) => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSynced, setIsSynced] = useState(true);

  // Listen to Raffles for current user from Supabase
  useEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);
      
      const fetchRaffles = async () => {
        try {
          const { data, error } = await supabase
            .from('raffles')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          // Map DB snake_case to app camelCase
          const mappedRaffles = data.map(r => ({
            ...r,
            userId: r.user_id,
            drawDate: r.draw_date,
            drawTime: r.draw_time,
            ticketCount: r.ticket_count,
            ticketColor: r.ticket_color,
            createdAt: r.created_at
          }));
          
          setRaffles(mappedRaffles);
          setIsSynced(true);
        } catch (err) {
          console.error("Error fetching raffles:", err);
          setError("No se pudieron cargar los datos. Verifica tu conexión.");
        } finally {
          setLoading(false);
        }
      };

      fetchRaffles();

      // Set up realtime subscription
      const subscription = supabase
        .channel('public:raffles')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'raffles',
            filter: `user_id=eq.${user.uid}`
        }, (payload) => {
            fetchRaffles(); // Reload on change to keep it simple and synced
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setRaffles([]);
    }
  }, [user]);

  const addRaffle = async (data) => {
    if (!user) return;

    const { title, prizes, ticketCount, customCount, template, image, ticketColor, drawDate, drawTime } = data;
    const finalCount = customCount ? parseInt(customCount) : parseInt(ticketCount);

    const newRaffle = {
      user_id: user.uid,
      title,
      draw_date: drawDate || null,
      draw_time: drawTime || null,
      prizes: prizes.filter(p => p.trim() !== '').map(p => ({
        name: p,
        winner: null
      })),
      ticket_count: finalCount,
      template,
      ticket_color: ticketColor || '#06b6d4',
      image: image || null,
      tickets: Array.from({ length: finalCount }, (_, i) => ({
        number: i + 1,
        status: 'available',
        holder: null
      }))
    };

    try {
      const { data: insertedData, error } = await supabase
        .from('raffles')
        .insert([newRaffle])
        .select()
        .single();

      if (error) throw error;

      // Map back to camelCase for local state and notifications
      const mappedRaffle = {
        ...insertedData,
        userId: insertedData.user_id,
        drawDate: insertedData.draw_date,
        drawTime: insertedData.draw_time,
        ticketCount: insertedData.ticket_count,
        ticketColor: insertedData.ticket_color,
        createdAt: insertedData.created_at
      };

      // Optimistic update immediately
      setRaffles(prev => [mappedRaffle, ...prev]);

      if (mappedRaffle.drawDate) {
        notificationService.scheduleRaffleReminder(mappedRaffle);
      }

      return mappedRaffle.id;
    } catch (e) {
      console.error("Error adding raffle: ", e);
      throw e;
    }
  };

  const getRaffle = (id) => raffles.find(r => r.id === id);

  const updateTicket = async (raffleId, ticketNumber, holderInfo) => {
    if (!user) return;

    const currentRaffle = raffles.find(r => r.id === raffleId);
    if (!currentRaffle) return;

    const updatedTickets = currentRaffle.tickets.map(ticket => {
      if (ticket.number !== ticketNumber) return ticket;
      if (holderInfo) {
        return { ...ticket, status: 'sold', holder: holderInfo };
      } else {
        return { ...ticket, status: 'available', holder: null };
      }
    });

    // Optimistic update
    setRaffles(prev => prev.map(r => r.id === raffleId ? { ...r, tickets: updatedTickets } : r));

    try {
      const { error } = await supabase
        .from('raffles')
        .update({ tickets: updatedTickets })
        .eq('id', raffleId);
        
      if (error) throw error;
    } catch (e) {
      console.error("Error updating ticket: ", e);
    }
  };

  const assignPrizeWinner = async (raffleId, prizeIndex, winnerInfo) => {
    if (!user) return;
    const currentRaffle = raffles.find(r => r.id === raffleId);
    if (!currentRaffle) return;

    const updatedPrizes = currentRaffle.prizes.map((prize, idx) => {
      if (idx !== prizeIndex) return prize;
      const prizeObj = typeof prize === 'string' ? { name: prize, winner: null } : prize;
      return { ...prizeObj, winner: winnerInfo };
    });

    // Optimistic update
    setRaffles(prev => prev.map(r => r.id === raffleId ? { ...r, prizes: updatedPrizes } : r));

    try {
      const { error } = await supabase
        .from('raffles')
        .update({ prizes: updatedPrizes })
        .eq('id', raffleId);
        
      if (error) throw error;
    } catch (e) {
      console.error("Error assigning prize winner: ", e);
    }
  };

  const deleteRaffle = async (id) => {
    if (!user) return;
    
    // Optimistic update
    setRaffles(prev => prev.filter(r => r.id !== id));
    
    try {
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      notificationService.cancelRaffleReminder(id);
    } catch (e) {
      console.error("Error deleting raffle: ", e);
    }
  };

  const updateRaffle = async (id, data) => {
    if (!user) return;
    const currentRaffle = raffles.find(r => r.id === id);
    if (!currentRaffle) return;

    const { title, prizes, ticketCount, customCount, template, image, ticketColor, drawDate, drawTime } = data;
    const finalCount = customCount ? parseInt(customCount) : parseInt(ticketCount);

    let currentTickets = [...(currentRaffle.tickets || [])];

    if (finalCount > currentTickets.length) {
      const newTickets = Array.from({ length: finalCount - currentTickets.length }, (_, i) => ({
        number: currentTickets.length + i + 1,
        status: 'available',
        holder: null
      }));
      currentTickets = [...currentTickets, ...newTickets];
    } else if (finalCount < currentTickets.length) {
      currentTickets = currentTickets.slice(0, finalCount);
    }

    const updatedPrizes = prizes.filter(p => p.trim() !== '').map((prizeStr, idx) => {
      const existingPrize = currentRaffle.prizes && currentRaffle.prizes[idx];
      if (existingPrize && typeof existingPrize === 'object') {
        return { ...existingPrize, name: prizeStr };
      }
      return { name: prizeStr, winner: typeof existingPrize === 'string' ? null : (existingPrize?.winner || null) };
    });

    const updatedData = {
      title,
      draw_date: drawDate || null,
      draw_time: drawTime || null,
      prizes: updatedPrizes,
      ticket_count: finalCount,
      template,
      ticket_color: ticketColor || currentRaffle.ticketColor || '#06b6d4',
      image: image || currentRaffle.image,
      tickets: currentTickets
    };

    // Optimistic update
    const mappedRaffle = {
      ...currentRaffle,
      ...data,
      drawDate,
      drawTime,
      ticketCount: finalCount,
      ticketColor: updatedData.ticket_color,
      prizes: updatedPrizes,
      tickets: currentTickets
    };
    setRaffles(prev => prev.map(r => r.id === id ? mappedRaffle : r));

    try {
      const { error } = await supabase
        .from('raffles')
        .update(updatedData)
        .eq('id', id);
        
      if (error) throw error;

      if (mappedRaffle.drawDate) {
        notificationService.scheduleRaffleReminder(mappedRaffle);
      } else {
        notificationService.cancelRaffleReminder(id);
      }
    } catch (e) {
      console.error("Error updating raffle: ", e);
    }
  };

  return (
    <RaffleContext.Provider value={{ raffles, loading, error, isSynced, addRaffle, getRaffle, updateTicket, deleteRaffle, updateRaffle, assignPrizeWinner }}>
      {children}
    </RaffleContext.Provider>
  );
};
