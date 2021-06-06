import './App.css';
import React, {useState} from "react";
import {Component} from "react";
import firebase from 'firebase/app';
import 'firebase/firestore'
import { render } from 'react-dom';
import Select from 'react-select'
import "firebase/auth";
import "firebase/storage";


//util fb
var firebaseConfig = {
  apiKey: "AIzaSyDQo6NTf4fsIjvqbbhISSAx_X6Svtx2LFw",
  authDomain: "onthisdaycwb.firebaseapp.com",
  projectId: "onthisdaycwb",
  storageBucket: "onthisdaycwb.appspot.com",
  messagingSenderId: "570389339615",
  appId: "1:570389339615:web:471b8d5c20067bcb52786a",
  measurementId: "G-C4MWCCVMS2"
};

if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

let db=firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth().app;
let syear = '';
let smonth = '';

async function getQ(){

  const isYear=db.collection("submissions").where("studentFirst", "==",  syear).get();
  const isMonth=db.collection("submissions").where("studentLast", "==",  smonth).get();
  //const isSource=db.collection("unverified").where()
  const [yearSnapshot, monthSnapshot]=await Promise.all([
    isYear,
    isMonth
  ]);
  const yearArray = yearSnapshot.docs;
  const monthArray=monthSnapshot.docs;
  const qArray=yearArray.concat(monthArray);
  return qArray;
}



class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      docs: [],
      checks: [],
      yearname: '',
      monthname: '',
      sourcename1: '',
      renderList: null,
    };
  }

  
  //sets state of country being searched
  myYearchangeHandler = (event) => {
    this.setState({yearname: event.target.value});
  }
  myMonthchangeHandler = (event1) => {
    this.setState({monthname: event1.target.value});
  }

    //clear page before rendering
    componentDidMount(){
      this.setState({
        renderList: false
      })
    }
  
  handleFormSubmit = formSubmitEvent => {
    formSubmitEvent.preventDefault();
    console.log(this.state.yearname);
    syear=this.state.yearname;
    smonth=this.state.monthname;
    this.setState({renderList: true})
    this.state.docs.length=0;
    getQ().then((snapshot) => (
      snapshot.forEach((doc) => (
        console.log(doc.data().description),
        this.setState((prevState) => ({
          docs: [...prevState.docs, {
            docID: doc.id,
            name: doc.data().subjectName,
            description: doc.data().description,
            studentfirst: doc.data().studentFirst,
            studentlast: doc.data().studentLast,
          }],
        }
        
        ))
      ))
    ))
  }
  //show all entries
  handleAllQuery = formSubmitEventAll => {
    formSubmitEventAll.preventDefault();
    this.state.docs.length=0;
    db.collection("submissions").get().then((snapshot) => (
      snapshot.forEach((doc) => (
         this.setState((prevState) => ({
          docs: [...prevState.docs, {
            docID: doc.id,
            name: doc.data().subjectName,
            description: doc.data().description,
            studentfirst: doc.data().studentFirst,
            studentlast: doc.data().studentLast,
          }],
        }

        ))
      ))
    ))
  }

  //state for checkboxes
  //makes sure individual checkboxes can be checked and stuff
  handleCheckboxChange = changeEvent => {
    let boxArray=[...this.state.checks, changeEvent.target.id];
    if(this.state.checks.includes(changeEvent.target.id)){
      boxArray = boxArray.filter(check => check !== changeEvent.target.id);
    }
  
    this.setState({
      checks: boxArray,
    });

  };

  //move functionality
  handleCheckSubmit = formCSubmitEvent => {
    formCSubmitEvent.preventDefault();
    //array of id strings for delete
    let stringarr = this.state.checks.map((c)=>
      db.collection("submissions").doc(String(c))
    .get()
    .then(function(doc) {
      if (doc.exists) {
        //console.log("Document data:", doc.data());
        //push doc with same name to verified collection
        db.collection("verified").doc(String(c)).set(doc.data());
        //delete document from unverified collection
        db.collection("submissions").doc(String(c)).delete().then(()=>{
            console.log("Document successfully deleted!");
        }).catch((error)=>{
          console.error("Error removing document: ", error);
        });
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    )
    
  };

  render() {
    let displayDocs=this.state.docs.map((d) =>(  
      
      <div key={d.docID}>
        <h1>Submission ID: {d.docID}</h1>
        <p><strong>Name of Person: </strong> {d.name}</p>
        <p><strong>Date: </strong> {d.date}</p>
        <p><strong>City: </strong> {d.city}</p>
        <p><strong>Country: </strong> {d.country}</p>
        <p><strong>Name of Source: </strong> {d.sourcename}</p>
        <p><strong>Source link: </strong> {d.link}</p>
        <p><strong>Event Description:</strong> {d.description}</p>
        <div>
        <label>
        <strong>Validate {d.docID}?</strong>
        <input
                  id={d.docID}
                  type="checkbox"
                  onChange={this.handleCheckboxChange}
        />
        </label>
        </div>
      </div> 
    ))

    return (
      <div>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></link>      <form>
        <h1>Submission Verification Portal</h1>
        <p>Filter by year:</p>
        <input
          type="text"
          onChange={this.myYearchangeHandler}
        />
        <p>Filter by month:</p>
        <input
          type="text"
          onChange={this.myMonthchangeHandler}
        />
        <br />
        <br />
        <button onClick={this.handleFormSubmit.bind(this)}>Submit</button>
        <br />
        <br />
        <button onClick={this.handleAllQuery.bind(this)}>View All Unverified Submissions</button>     
        </form>
        {displayDocs}
        <br />
        <br />
        <button onClick={this.handleCheckSubmit.bind(this)}>Verify Checked Info</button>
        <br />
        <br />
      </div>
    );
}
}

export default App;