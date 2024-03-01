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
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent))
      );
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem(
      "editorContent",
      JSON.stringify(convertToRaw(contentState))
    );
  }, [editorState]);

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selection.getStartKey());
    const text = block.getText();

    const triggerMap = {
      "#": "header-one",
      "**": "UNDERLINE",
      "*": "BOLD",
      "***": "COLOR_STYLE", // Change color as needed
    };

    for (const trigger in triggerMap) {
      if (chars === " " && text.startsWith(`${trigger} `)) {
        if (trigger === "***") {
          const contentStateWithEntity = contentState.createEntity(
            "COLOR_STYLE",
            "IMMUTABLE",
            { color: "red" } // Change color as needed
          );
          const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

          const newEditorState = EditorState.set(editorState, {
            currentContent: Modifier.applyEntity(
              contentStateWithEntity,
              selection.merge({
                anchorOffset: 0,
                focusOffset: trigger.length,
              }),
              entityKey
            ),
          });

          const nextState = EditorState.forceSelection(
            newEditorState,
            newEditorState.getCurrentContent().getSelectionAfter()
          );
          setEditorState(nextState);
          return "handled";
        } else {
          const style = triggerMap[trigger];
          const newContentState = Modifier.replaceText(
            contentState,
            selection.merge({
              anchorOffset: 0,
              focusOffset: trigger.length,
            }),
            "",
            null
          );
          const newEditorState = EditorState.push(
            editorState,
            newContentState,
            "remove-range"
          );
          const nextState =
            style === "header-one"
              ? RichUtils.toggleBlockType(newEditorState, style)
              : RichUtils.toggleInlineStyle(newEditorState, style);
          setEditorState(nextState);
          return "handled";
        }
      }
    }

    return "not-handled";
  };

  return (
    <div className="RichEditor-root">
      <div className="RichEditor-controls">
        <button onClick={() => localStorage.removeItem("editorContent")}>
          Clear Saved Content
        </button>
      </div>
      <div className="RichEditor-editor">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          onChange={onChange}
          placeholder="Tell a story..."
          spellCheck={true}
        />
      </div>
    </div>
  );
};

export default TextEditor;
