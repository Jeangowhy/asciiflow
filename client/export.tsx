import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextareaAutosize,
} from "@material-ui/core";
import { ASCII, UNICODE, DOUBLE_STRUCK, ARROWED, DOTTED, STRONG_STRUCK, STRONG_SIDE } from "#asciiflow/client/constants";
import styles from "#asciiflow/client/export.module.css";
import { DrawingId, store } from "#asciiflow/client/store";
import { layerToText } from "#asciiflow/client/text_utils";
import * as React from "react";
import { useWatchable } from "#asciiflow/common/watchable"; 
export interface IExportConfig {
  wrapper?: "star" | "star-filled" | "triple-quotes" | "hash" | "slash" | "three-slashes" | "dash" | "apostrophe" | "semicolon" | "backticks" | "four-spaces";
  indent?: number;
  characters?: "basic" | "extended";
}

const CharMap = [
  {"key":"double_struck", "title": "Double Struck", "chartset": DOUBLE_STRUCK},
  {"key":"arrowed", "title": "Arrowed", "chartset": ARROWED},
  {"key":"dotted", "title": "Dotted", "chartset": DOTTED},
  {"key":"strong_struck", "title": "Strong Struck", "chartset": STRONG_STRUCK},
  {"key":"strong_side", "title": "Strong Side", "chartset": STRONG_SIDE},
  {"key":"extended", "title": "ASCII Extended", "chartset": UNICODE},
  {"key":"basic", "title": "ASCII Basic", "chartset": ASCII},
]

export function ExportDialog({
  button,
  drawingId,
}: {
  button: React.ReactNode;
  drawingId: DrawingId;
}) {
  return useWatchable(() => {
    const [open, setOpen] = React.useState(false);
    const exportConfig = store.exportConfig.get();
    // Only compute the text if the dialog is open.
    const drawingText = open
      ? applyConfig(layerToText(store.canvas(drawingId).committed), exportConfig)
      : "";
    return (
      <>
        <span onClick={(e) => setOpen(true)}>{button}</span>
        <Dialog
          open={Boolean(open)}
          onClose={() => setOpen(null)}
          className={store.darkMode.get() ? "dark" : ""}
        >
          <DialogTitle>Export drawing</DialogTitle>
          <DialogContent>
            <FormControl className={styles.formControl}>
              <InputLabel>Character set</InputLabel>
              <Select
                value={exportConfig.characters ?? "extended"}
                onChange={(e) =>
                  store.exportConfig.set({
                    ...exportConfig,
                    characters: e.target.value as any,
                  })
                }
              >
                {CharMap.map( (it) => (<MenuItem key={it.key} value={it.key}>{it.title}</MenuItem>))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogContent>
            <FormControl className={styles.formControl}>
              <InputLabel>Comment type</InputLabel>
              <Select
                value={exportConfig.wrapper || "none"}
                onChange={(e) =>
                  store.exportConfig.set({
                    ...exportConfig,
                    wrapper: e.target.value as any,
                  })
                }
              >
                <MenuItem value={"none"}>None</MenuItem>
                <MenuItem value={"star"}>
                  Standard multi-line <CommentTypeChip label="/* */" />
                </MenuItem>
                <MenuItem value={"star-filled"}>
                  Filled multi-line <CommentTypeChip label="/***/" />
                </MenuItem>
                <MenuItem value={"triple-quotes"}>
                  Quotes multi-line <CommentTypeChip label='""" """' />
                </MenuItem>
                <MenuItem value={"hash"}>
                  Hashes <CommentTypeChip label="#" />
                </MenuItem>
                <MenuItem value={"slash"}>
                  Slashes <CommentTypeChip label="//" />
                </MenuItem>
                <MenuItem value={"three-slashes"}>
                  Three Slashes <CommentTypeChip label="///" />
                </MenuItem>
                <MenuItem value={"dash"}>
                  Dashes <CommentTypeChip label="--" />
                </MenuItem>
                <MenuItem value={"apostrophe"}>
                  Apostrophies <CommentTypeChip label="'" />
                </MenuItem>
                <MenuItem value={"backticks"}>
                  Backticks multi-line <CommentTypeChip label="``` ```" />
                </MenuItem>
                <MenuItem value={"four-spaces"}>
                  Four Spaces <CommentTypeChip label="    " />
                </MenuItem>
                <MenuItem value={"semicolon"}>
                  Semicolons <CommentTypeChip label=";" />
                </MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogContent>
            <TextareaAutosize value={drawingText} className={styles.textArea} />
          </DialogContent>
          <DialogActions>
            <CopyToClipboardButton text={drawingText} />
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  });
}

function CommentTypeChip({ label }: { label: React.ReactNode }) {
  return (
    <Chip
      style={{ marginLeft: "5px" }}
      label={
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>{label}</span>
      }
      size="small"
    />
  );
}

function CopyToClipboardButton({ text }: { text: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        color="primary"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setOpen(true);
        }}
      >
        Copy to clipboard
      </Button>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        message="Copied drawing to clipboard"
        action={
          <Button color="secondary" size="small" onClick={() => setOpen(false)}>
            Dismiss
          </Button>
        }
      />
    </>
  );
}

function applyConfig(text: string, exportConfig: IExportConfig) {
  function lines() {
    return text.split("\n");
  }
  function setLines(lines: string[]) {
    text = lines.join("\n");
  }

  const preset = CharMap.find(it => it.key == exportConfig.characters)

  console.log({preset, exportConfig})
  if ("extended" != exportConfig.characters && preset) {
    const charmap = new Map(Object.entries(preset.chartset).map( 
      ([key, value]) =>[UNICODE[key], preset.chartset[key]]))
    text = [...text].map((value) => charmap.get(value) || value).join("")
  }

  if (exportConfig.indent) {
    setLines(
      lines().map((line) => `${Array(exportConfig.indent).fill(" ")}${line}`)
    );
  }
  if (exportConfig.wrapper) {
    if (
      exportConfig.wrapper === "star" ||
      exportConfig.wrapper === "star-filled"
    ) {
      setLines([
        "/*",
        ...lines().map((line) =>
          exportConfig.wrapper === "star-filled" ? ` * ${line}` : line
        ),
        " */",
      ]);
    }
    if (exportConfig.wrapper === "triple-quotes") {
      setLines([
        exportConfig.characters === "basic" ? "\"\"\"" : "u\"\"\"",
        ...lines(),
        "\"\"\"",
      ]);
    }
    if (exportConfig.wrapper === "hash") {
      setLines(lines().map((line) => `# ${line}`));
    }
    if (exportConfig.wrapper === "slash") {
      setLines(lines().map((line) => `// ${line}`));
    }
    if (exportConfig.wrapper === "three-slashes") {
      setLines(lines().map((line) => `/// ${line}`));
    }
    if (exportConfig.wrapper === "dash") {
      setLines(lines().map((line) => `-- ${line}`));
    }
    if (exportConfig.wrapper === "apostrophe") {
      setLines(lines().map((line) => `' ${line}`));
    }
    if (exportConfig.wrapper === "backticks") {
      setLines([
        "```",
        ...lines(),
        "```",
      ]);
    }
    if (exportConfig.wrapper === "four-spaces") {
      setLines(lines().map((line) => `    ${line}`));
    }
    if (exportConfig.wrapper === "semicolon") {
      setLines(lines().map((line) => `; ${line}`));
    }
  }
  return text;
}
