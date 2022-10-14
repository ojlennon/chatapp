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


function App(props) {
  const user = props.user;
  return (
    <div className="App">
      <header>
        <h1>Chat App</h1>
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
  const [formValue, setFormValue] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

     await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
    // root.render(<App user={auth.currentUser} />)
  }

  const retriveData = async () => {
    const teemp = []
    const snapQ = await getDocs(qer);
      
    snapQ.forEach((doc) => {
      let tempReply = doc.data();
      tempReply.id = doc.id;
      teemp.push(tempReply);
    })
    return teemp
  }
  retriveData().then(messages => setMessages(messages));

  // const p = Promise.resolve(retriveData())
  // p.then((v) => {
  //   console.log(v)
  // })
  const { uid, photoURL } = auth.currentUser;


  return (<>
    <main>
    {messages.length != 0 && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    </main>

    <span ref={dummy}></span>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Text Here" />

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>);
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      {/* <img src='https://images.unsplash.com/flagged/photo-1566127992631-137a642a90f4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=1000&q=80'/> */}
      <p>{text}</p>
    </div>
  </>)
}


export default App;
