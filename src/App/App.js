import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoteListNav from "../NoteListNav/NoteListNav";
import NotePageNav from "../NotePageNav/NotePageNav";
import NoteListMain from "../NoteListMain/NoteListMain";
import NotePageMain from "../NotePageMain/NotePageMain";
import AddFolder from "../AddFolder/AddFolder";
import AddNote from "../AddNote/AddNote";
import ApiContext from "../ApiContext";
import config from "../config";
import "./App.css";
import ErrorBoundary from "../ErrorBoundary";

class App extends Component {
  state = {
    notes: [],
    folders: [],
  };

  componentDidMount() {
    Promise.all([
      fetch(`${config.API_ENDPOINT}/notes`),
      fetch(`${config.API_ENDPOINT}/folders`),
    ])
      .then(([notesRes, foldersRes]) => {
        if (!notesRes.ok) return notesRes.json().then((e) => Promise.reject(e));
        if (!foldersRes.ok)
          return foldersRes.json().then((e) => Promise.reject(e));

        return Promise.all([notesRes.json(), foldersRes.json()]);
      })
      .then(([notes, folders]) => {
        this.setState({ notes, folders });
      })
      .catch((error) => {
        //also tried this.setState({hasError: true}) for error boundary
        // but it didn't work
        this.setState({ error });
      });
  }
  // try catch for error bundary in event handlers
  handleAddFolder = (folder) => {
    try {
      this.setState({
        folders: [...this.state.folders, folder],
      });
    } catch (error) {
      this.setState({ hasError: true });
    }
  };

  handleAddNote = (note) => {
    try {
      this.setState({
        notes: [...this.state.notes, note],
      });
    } catch (error) {
      this.setState({ hasError: true });
    }
  };

  handleDeleteNote = (noteId) => {
    try {
      this.setState({
        notes: this.state.notes.filter((note) => note.id !== noteId),
      });
    } catch (error) {
      this.setState({ hasError: true });
    }
  };

  renderNavRoutes() {
    return (
      <>
        {["/", "/folder/:folderId"].map((path) => (
          <Route exact key={path} path={path} component={NoteListNav} />
        ))}
        <Route path="/note/:noteId" component={NotePageNav} />
        <Route path="/add-folder" component={NotePageNav} />
        <Route path="/add-note" component={NotePageNav} />
      </>
    );
  }

  renderMainRoutes() {
    return (
      <>
        {["/", "/folder/:folderId"].map((path) => (
          <Route exact key={path} path={path} component={NoteListMain} />
        ))}
        <Route path="/note/:noteId" component={NotePageMain} />
        <Route path="/add-folder" component={AddFolder} />
        <Route path="/add-note" component={AddNote} />
      </>
    );
  }

  render() {
    const value = {
      notes: this.state.notes,
      folders: this.state.folders,
      addFolder: this.handleAddFolder,
      addNote: this.handleAddNote,
      deleteNote: this.handleDeleteNote,
    };
    return (
      <ErrorBoundary>
        <ApiContext.Provider value={value}>
          <div className="App">
            <nav className="App__nav">{this.renderNavRoutes()}</nav>
            <header className="App__header">
              <h1>
                <Link to="/">Noteful</Link>{" "}
                <FontAwesomeIcon icon="check-double" />
              </h1>
            </header>
            <main className="App__main">{this.renderMainRoutes()}</main>
          </div>
        </ApiContext.Provider>
      </ErrorBoundary>
    );
  }
}

export default App;
