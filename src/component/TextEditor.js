import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "../App.css";

const TextEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const sc = localStorage.getItem("editorContent");
    if (sc) {
      return EditorState.createWithContent(convertFromRaw(JSON.parse(sc)));
    }
    return EditorState.createEmpty();
  });

  const [saveRequested, setSaveRequested] = useState(false);

  useEffect(() => {
    if (saveRequested) {
      const contentState = editorState.getCurrentContent();
      localStorage.setItem(
        "editorContent",
        JSON.stringify(convertToRaw(contentState))
      );
      setSaveRequested(false);
    }
  }, [editorState, saveRequested]);

  const onChange = (nes) => {
    setEditorState(nes);
  };

  const handleKeyCommand = (cmd) => {
    const ns = RichUtils.handleKeyCommand(editorState, cmd);
    if (ns) {
      onChange(ns);
      return "handled";
    }
    return "not-handled";
  };

  const handleBeforeInput = (ch, es) => {
    const selection = es.getSelection();
    const contentState = es.getCurrentContent();
    const block = contentState.getBlockForKey(selection.getStartKey());
    const text = block.getText();

    if (ch === " " && text.startsWith("# ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        "",
        null
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );

      const nextState = RichUtils.toggleBlockType(newEditorState, "header-one");
      setEditorState(nextState);

      return "handled";
    }

    if (ch === " " && text.startsWith("* ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        "",
        null
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );

      const nextState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
      setEditorState(nextState);

      return "handled";
    }

    if (ch === " " && text.startsWith("** ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        "",
        null
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );

      const nextState = EditorState.setInlineStyleOverride(
        newEditorState,
        new Set(["red"])
      );
      setEditorState(nextState);

      return "handled";
    }

    if (ch === " " && text.startsWith("*** ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 4,
        }),
        "",
        null
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );

      const nextState = RichUtils.toggleInlineStyle(
        newEditorState,
        "UNDERLINE"
      );
      setEditorState(nextState);

      return "handled";
    }

    if (ch === " " && text.startsWith("````` ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 6,
        }),
        "",
        null
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );

      const nextState = RichUtils.toggleBlockType(newEditorState, "code-block");
      setEditorState(nextState);

      return "handled";
    }

    return "not-handled";
  };

  const handleSave = () => {
    setSaveRequested(true);
  };

  return (
    <div className="RichEditor-root">
      <div className="RichEditor-controls">
        <button onClick={handleSave} className="save-btn">
          Save
        </button>
      </div>
      <div className="RichEditor-editor">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          onChange={onChange}
          placeholder="Start typing..."
          spellCheck={true}
        />
      </div>
    </div>
  );
};

export default TextEditor;
