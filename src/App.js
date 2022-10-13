import React, { useRef, useState } from 'react';
import './App.css';
import ReactDOM from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup  } from 'firebase/auth';
import { getDocs, getFirestore, query, limit, collection, orderBy, addDoc, onSnapshot, serverTimestamp, setDoc, doc, DocumentSnapshot, getDoc, snapshot, options} from 'firebase/firestore';
import root from './index'

// import { getAuth } from 'react-firebase-hooks/auth';
// import { useCollectionData } from 'react-firebase-hooks/firestore';

const app = initializeApp({
  apiKey: "AIzaSyBejIt3n3WhiarVBvxP8GeTBo8gVRZ1_eg",
  authDomain: "chat-app-964bb.firebaseapp.com",
  projectId: "chat-app-964bb",
  storageBucket: "chat-app-964bb.appspot.com",
  messagingSenderId: "1086239885629",
  appId: "1:1086239885629:web:f07e1a0bdc077bcf48dd54",
  measurementId: "G-7KECNL9XN3"
})

const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);


onAuthStateChanged(auth, (user) => {
  if (user) {
    root.render(<App user={user} />)
  } else {
    root.render(<App/>)
  }
    
})

class Message {
  constructor(text, uid, createdAt, photoURL) {
    this.text = text;
    this.uid = uid;
    this.createdAt = createdAt;
    this.photoURL = photoURL;
  }
}

const messageConverter = {
  toFirestore: (message) => {
    return {
      id: message.uid,
      createdAt: message.createdAt,
      text: message.text,
      photoURL: message.photoURL
    }
  },
  fromFirestore: (snapshot) => {
    const data = snapshot.data();
    return new Message(data.text, data.id, data.createdAt, data.photoURL)
  }
};



function App(props) {
  const user = props.user;
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
        
      </section>

    </div>
  );
}


function SignIn() {

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}



function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const qer = query(messagesRef, orderBy("createdAt"), limit(25));
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

     await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });
    
    console.log(formValue)

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
    root.render(<App user={auth.currentUser} />)
  }

  // const retriveData = async () => {
  //   const teemp = []
  //   const snapQ = await getDocs(qer);
  //   getDocs(qer).then((doc) => {

  //    }
      
  //   snapQ.forEach((doc) => {
  //     let tempReply = doc.data();
  //     tempReply.id = doc.id;
  //     teemp.push(tempReply);
  //   })
  //   return teemp
  // }
  let messages = [];
  getDocs(qer).then((snapshot) => {
    snapshot.forEach((doc) => {
      let tempReply = doc.data();
      tempReply.id = doc.id;
      messages.push(tempReply);
    })
  });
  console.log(messages)

  // const p = Promise.resolve(retriveData())
  // p.then((v) => {
  //   console.log(v)
  // })
  const { uid, photoURL } = auth.currentUser;
  const docRef = addDoc(messagesRef, {
    text: formValue,
    createdAt: serverTimestamp(),
    uid,

  })


  return (<>
    <main>
    {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    </main>

    <span ref={dummy}></span>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Text Here" />

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>);
}

function chats() {
  
}


function ChatMessage(props) {
  console.log("Here")
  const { text, uid, photoURL } = props.message.data();
  console.log(props.key);

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  console.log(messageClass);

  return (<>
    <div className={`${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;









//   const unsubscribe = onSnapshot(qer, (querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       messages.push(doc.data);
//     })
//   console.log(messages)

// })
  
  
  // const querSnapshot = getDocs(qer);
  // querSnapshot.forEach((doc) => messages.push(doc.data()))
  // console.log(messages);
  
  // const query = messagesRef.orderBy('createdAt').limit(25);
  // const [messages] = useCollectionData(query, { idField: 'id' });