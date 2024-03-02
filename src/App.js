import TextEditor from "./component/TextEditor";
import "./App.css";
import "./TextEditor.css";

export default function App() {
  return (
    <div className="container">
      <div className="header">Demo editor by Sanjay Kumar</div>
      <TextEditor />
    </div>
  );
}
