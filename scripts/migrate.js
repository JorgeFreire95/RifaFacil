import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ==========================================
// CONFIGURACIÓN
// ==========================================
// 1. Coloca tu archivo JSON de cuenta de servicio de Firebase en esta misma carpeta y renómbralo a "service-account.json"
const serviceAccountPath = './service-account.json';

// 2. Necesitas la Service Role Key de Supabase para evitar las políticas RLS y poder insertar libremente
// Asegúrate de agregarla a tu .env.local como VITE_SUPABASE_SERVICE_ROLE_KEY o ponla aquí temporalmente.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'PON_TU_SERVICE_ROLE_KEY_AQUI';

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`ERROR: No se encontró el archivo de Firebase ${serviceAccountPath}. Descárgalo desde la consola de Firebase.`);
    process.exit(1);
}

if (!supabaseUrl || supabaseServiceKey === 'PON_TU_SERVICE_ROLE_KEY_AQUI') {
    console.error(`ERROR: Faltan credenciales de Supabase. Necesitas la URL y la Service Role Key.`);
    process.exit(1);
}

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Inicializar Supabase Admin (con Service Role Key para bypassear RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function migrateData() {
    console.log("Iniciando migración...");

    try {
        // 1. Migrar Usuarios
        console.log("Migrando usuarios...");
        const usersSnapshot = await db.collection('users').get();
        const usersData = [];
        
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            // Asegúrate de mapear los campos correctamente según tu nueva tabla
            usersData.push({
                id: doc.id,
                name: data.name,
                email: data.email,
                role: data.role || 'user',
                photo_url: data.photoURL || null,
                phone_number: data.phoneNumber || null,
                created_at: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
                last_login: data.lastLogin ? new Date(data.lastLogin).toISOString() : null,
                provider: data.provider || 'password'
            });
        });

        if (usersData.length > 0) {
            const { error: usersError } = await supabase.from('users').upsert(usersData);
            if (usersError) throw usersError;
            console.log(`✅ ${usersData.length} usuarios migrados.`);
        } else {
            console.log("No hay usuarios para migrar.");
        }

        // 2. Migrar Rifas
        console.log("Migrando rifas...");
        const rafflesSnapshot = await db.collection('raffles').get();
        const rafflesData = [];

        rafflesSnapshot.forEach(doc => {
            const data = doc.data();
            rafflesData.push({
                id: doc.id,
                user_id: data.userId,
                title: data.title,
                draw_date: data.drawDate,
                draw_time: data.drawTime,
                prizes: data.prizes || [],
                ticket_count: data.ticketCount,
                template: data.template,
                ticket_color: data.ticketColor,
                image: data.image,
                created_at: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
                tickets: data.tickets || []
            });
        });

        if (rafflesData.length > 0) {
            // Dividir en lotes si son muchas rifas (Supabase prefiere lotes <= 1000)
            const chunkSize = 500;
            for (let i = 0; i < rafflesData.length; i += chunkSize) {
                const chunk = rafflesData.slice(i, i + chunkSize);
                const { error: rafflesError } = await supabase.from('raffles').upsert(chunk);
                if (rafflesError) throw rafflesError;
            }
            console.log(`✅ ${rafflesData.length} rifas migradas.`);
        } else {
            console.log("No hay rifas para migrar.");
        }

        console.log("🎉 ¡Migración completada con éxito!");

    } catch (error) {
        console.error("❌ Ocurrió un error durante la migración:", error);
    }
}

migrateData();
