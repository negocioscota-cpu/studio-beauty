// ============================================================
// LASHBROW — Firebase Configuration
// Projeto: lashbrow-app
// ============================================================

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

// 🔌 Habilitar persistência offline — dados ficam em cache local (IndexedDB)
// Leituras funcionam offline com cache; escritas entram em fila e sincronizam ao reconectar
db.enablePersistence({ synchronizeTabs: true })
  .then(() => console.log('✅ Firestore offline persistence habilitada'))
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Offline: múltiplas abas abertas — apenas uma pode sincronizar offline.');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Offline: navegador não suporta persistência offline.');
    }
  });
