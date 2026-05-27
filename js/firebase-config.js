// Firebase Configuration — Studiobeauty
const firebaseConfig = {
    apiKey: "AIzaSyDu_7cRKPc2rLcukZTsb58yMN-g0IlvIYc",
    authDomain: "lashbrow-app.firebaseapp.com",
    projectId: "lashbrow-app",
    storageBucket: "lashbrow-app.firebasestorage.app",
    messagingSenderId: "516369013329",
    appId: "1:516369013329:web:0fd76e28780b2c98703670"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Ativação da persistência offline síncrona
db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
        console.log("Persistência offline do Firestore ativada com sucesso!");
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn("Persistência offline falhou: Múltiplas abas abertas.");
        } else if (err.code === 'unimplemented') {
            console.warn("Persistência offline não suportada pelo navegador atual.");
        }
    });
