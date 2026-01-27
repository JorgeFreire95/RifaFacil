import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

const RaffleContext = createContext();

export const useRaffle = () => useContext(RaffleContext);

export const RaffleProvider = ({ children }) => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState([]);

  // Load raffles for the current user when user changes
  useEffect(() => {
    if (user) {
      const allRaffles = JSON.parse(localStorage.getItem('all_raffles_db') || '[]');
      const userRaffles = allRaffles.filter(r => r.userId === user.id);
      // Sort by newest first
      setRaffles(userRaffles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } else {
      setRaffles([]);
    }
  }, [user]);

  // Helper to persist to "DB"
  const saveToDb = (updatedUserRaffles) => {
    // Get current DB
    const allRaffles = JSON.parse(localStorage.getItem('all_raffles_db') || '[]');
    // Remove old versions of this user's raffles
    const otherRaffles = allRaffles.filter(r => r.userId !== user.id);
    // Combine
    const newDb = [...otherRaffles, ...updatedUserRaffles];
    localStorage.setItem('all_raffles_db', JSON.stringify(newDb));
    // Update State
    setRaffles(updatedUserRaffles);
  };

  const addRaffle = (data) => {
    if (!user) return;

    const { title, prizes, ticketCount, customCount, template, image } = data;
    const finalCount = customCount ? parseInt(customCount) : parseInt(ticketCount);

    const newRaffle = {
      id: uuidv4(),
      userId: user.id, // Link to user
      title,
      prizes: prizes.filter(p => p.trim() !== ''),
      ticketCount: finalCount,
      template,
      image,
      createdAt: new Date().toISOString(),
      tickets: Array.from({ length: finalCount }, (_, i) => ({
        number: i + 1,
        status: 'available',
        holder: null
      }))
    };

    const newRafflesList = [newRaffle, ...raffles];
    saveToDb(newRafflesList);
    return newRaffle.id;
  };

  const getRaffle = (id) => raffles.find(r => r.id === id);

  const updateTicket = (raffleId, ticketNumber, holderInfo) => {
    if (!user) return;

    const updatedRaffles = raffles.map(raffle => {
      if (raffle.id !== raffleId) return raffle;

      const updatedTickets = raffle.tickets.map(ticket => {
        if (ticket.number !== ticketNumber) return ticket;
        if (holderInfo) {
          return { ...ticket, status: 'sold', holder: holderInfo };
        } else {
          return { ...ticket, status: 'available', holder: null };
        }
      });

      return { ...raffle, tickets: updatedTickets };
    });

    saveToDb(updatedRaffles);
  };

  const deleteRaffle = (id) => {
    if (!user) return;
    const updatedRaffles = raffles.filter(r => r.id !== id);
    saveToDb(updatedRaffles);
  };

  const updateRaffle = (id, data) => {
    if (!user) return;
    const { title, prizes, ticketCount, customCount, template, image } = data;
    const finalCount = customCount ? parseInt(customCount) : parseInt(ticketCount);

    const updatedRaffles = raffles.map(r => {
      if (r.id !== id) return r;

      // Logic to adjust tickets array size preserving existing data
      let currentTickets = r.tickets;
      if (finalCount > currentTickets.length) {
          // Add more
          const newTickets = Array.from({ length: finalCount - currentTickets.length }, (_, i) => ({
              number: currentTickets.length + i + 1,
              status: 'available',
              holder: null
          }));
          currentTickets = [...currentTickets, ...newTickets];
      } else if (finalCount < currentTickets.length) {
          // Truncate (warning: loose data if sold)
          currentTickets = currentTickets.slice(0, finalCount);
      }

      return {
        ...r,
        title,
        prizes: prizes.filter(p => p.trim() !== ''),
        ticketCount: finalCount,
        template,
        image: image || r.image,
        tickets: currentTickets
      };
    });

    saveToDb(updatedRaffles);
  };

  return (
    <RaffleContext.Provider value={{ raffles, addRaffle, getRaffle, updateTicket, deleteRaffle, updateRaffle }}>
      {children}
    </RaffleContext.Provider>
  );
};
