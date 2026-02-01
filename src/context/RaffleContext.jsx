import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

const RaffleContext = createContext();

export const useRaffle = () => useContext(RaffleContext);

export const RaffleProvider = ({ children }) => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSynced, setIsSynced] = useState(true);

  // Listen to Raffles for current user from Firestore
  useEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);
      const q = query(
        collection(db, "raffles"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userRaffles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Client-side sorting to avoid missing index issues in Firestore
        userRaffles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setRaffles(userRaffles);
        setIsSynced(!snapshot.metadata.fromCache);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching raffles:", err);
        setError("No se pudieron cargar los datos. Verifica tu conexión.");
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setRaffles([]);
    }
  }, [user]);

  const addRaffle = async (data) => {
    if (!user) return;

    const { title, prizes, ticketCount, customCount, template, image } = data;
    const finalCount = customCount ? parseInt(customCount) : parseInt(ticketCount);

    try {
      // Create a reference first to get the ID
      const newRaffleRef = doc(collection(db, "raffles"));

      const newRaffle = {
        id: newRaffleRef.id, // Include ID for local state
        userId: user.uid,
        title,
        prizes: prizes.filter(p => p.trim() !== ''),
        ticketCount: finalCount,
        template,
        image: image || null,
        createdAt: new Date().toISOString(),
        tickets: Array.from({ length: finalCount }, (_, i) => ({
          number: i + 1,
          status: 'available',
          holder: null
        }))
      };

      // OPTIMISTIC UPDATE: Update local state immediately
      setRaffles(prev => [newRaffle, ...prev]);

      // Save to Firestore (exclude ID from body if you strictly want clean docs, 
      // but usually Firestore docs don't contain their own ID field unless explicitly added. 
      // We'll strip it for the db save or just save it, it doesn't hurt).
      const { id, ...raffleData } = newRaffle;

      // Use setDoc with the pre-generated ref
      await setDoc(newRaffleRef, raffleData);

      return newRaffleRef.id;
    } catch (e) {
      console.error("Error adding raffle: ", e);
      throw e;
    }
  };

  const getRaffle = (id) => raffles.find(r => r.id === id);

  const updateTicket = async (raffleId, ticketNumber, holderInfo) => {
    if (!user) return;

    // Find the raffle in state to get current tickets
    const currentRaffle = raffles.find(r => r.id === raffleId);
    if (!currentRaffle) return;

    // Create updated tickets array
    const updatedTickets = currentRaffle.tickets.map(ticket => {
      if (ticket.number !== ticketNumber) return ticket;
      if (holderInfo) {
        return { ...ticket, status: 'sold', holder: holderInfo };
      } else {
        return { ...ticket, status: 'available', holder: null };
      }
    });

    try {
      const raffleRef = doc(db, "raffles", raffleId);
      await updateDoc(raffleRef, {
        tickets: updatedTickets
      });
    } catch (e) {
      console.error("Error updating ticket: ", e);
    }
  };

  const deleteRaffle = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "raffles", id));
    } catch (e) {
      console.error("Error deleting raffle: ", e);
    }
  };

  const updateRaffle = async (id, data) => {
    if (!user) return;
    const currentRaffle = raffles.find(r => r.id === id);
    if (!currentRaffle) return;

    const { title, prizes, ticketCount, customCount, template, image } = data;
    const finalCount = customCount ? parseInt(customCount) : parseInt(ticketCount);

    // Logic to adjust tickets array size preserving existing data
    let currentTickets = [...currentRaffle.tickets];

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

    try {
      const raffleRef = doc(db, "raffles", id);
      await updateDoc(raffleRef, {
        title,
        prizes: prizes.filter(p => p.trim() !== ''),
        ticketCount: finalCount,
        template,
        image: image || currentRaffle.image,
        tickets: currentTickets
      });
    } catch (e) {
      console.error("Error updating raffle: ", e);
    }
  };

  return (
    <RaffleContext.Provider value={{ raffles, loading, error, isSynced, addRaffle, getRaffle, updateTicket, deleteRaffle, updateRaffle }}>
      {children}
    </RaffleContext.Provider>
  );
};
