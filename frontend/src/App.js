import './App.css';
import {Route,Routes,Router} from "react-router-dom"
import chatPage from "./Pages/chatPage";
import HomePage from './Pages/homePage';

function App() {
  return (
    <div className="App">
    <Route path="/" exact component={HomePage} />
    <Route path="/chats" exact component={chatPage} />
    </div>
  );
}

export default App;
