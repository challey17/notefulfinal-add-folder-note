import React, { Component } from "react";
import NotefulForm from "../NotefulForm/NotefulForm";
import ApiContext from "../ApiContext";
import config from "../config";
import "./AddNote.css";
import ValidationError from "../ValidationError";
import PropTypes from "prop-types";

export default class AddNote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: {
        value: "",
        touched: false,
      },
      content: {
        value: "",
      },
      folderId: {
        value: "",
      },
    };
  }

  updateName(name) {
    this.setState({ name: { value: name } });
    //console.log(name);
  }

  updateContent(content) {
    this.setState({ content: { value: content } });
    //console.log(content);
  }

  updateFolderId(folderId) {
    this.setState({ folderId: { value: folderId } });
    //console.log(folderId);
  }

  static defaultProps = {
    history: {
      push: () => {},
    },
  };
  static contextType = ApiContext;

  handleSubmit = (e) => {
    e.preventDefault();
    const { name, content, folderId } = this.state;
    const newNote = {
      note_name: name.value,
      content: content.value,
      folderid: folderId.value,
      modified: new Date(),
    };
    fetch(`${config.API_ENDPOINT}/notes`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(newNote),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e));
        return res.json();
      })
      .then((note) => {
        this.context.addNote(note);
        this.props.history.push(`/folder/${note.folderId}`);
      })
      .catch((error) => {
        console.error({ error });
      });
  };

  validateName() {
    const name = this.state.name.value.trim();
    if (name.length === 0) {
      return "*note name is required";
    }
  }

  validateFolder() {
    const selected = this.state.folderId.value;
    if (!selected) {
      return "* select a folder";
    }
  }

  render() {
    const nameError = this.validateName();
    const folderError = this.validateFolder();
    const { folders = [] } = this.context;
    return (
      <section className="AddNote">
        <h2>Create a note</h2>
        <NotefulForm onSubmit={this.handleSubmit}>
          <div className="field">
            <label htmlFor="note-name-input">Name</label>
            <input
              type="text"
              id="note-name-input"
              name="note-name"
              onChange={(e) => this.updateName(e.target.value)}
            />
            {!this.state.name.touched && (
              <ValidationError message={nameError} />
            )}
          </div>
          <div className="field">
            <label htmlFor="note-content-input">Content</label>
            <textarea
              id="note-content-input"
              name="note-content"
              onChange={(e) => this.updateContent(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="note-folder-select">Folder</label>
            <select
              id="note-folder-select"
              name="note-folder-id"
              onChange={(e) => this.updateFolderId(e.target.value)}
            >
              <option value={null}>...</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.folder_name}
                </option>
              ))}
            </select>
            {!this.state.folder && <ValidationError message={folderError} />}
          </div>
          <div className="buttons">
            <button
              type="submit"
              disabled={this.validateName() || this.validateFolder()}
            >
              Add note
            </button>
          </div>
        </NotefulForm>
      </section>
    );
  }
}

AddNote.propTypes = {
  history: PropTypes.object,
  push: PropTypes.func,
};
