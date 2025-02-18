import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";

const AlertAgreeDisagree = ({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="custom-dialog-title"
      aria-describedby="custom-dialog-description"
    >
      <DialogTitle id="custom-dialog-title">
        <WarningIcon color="warning" style={{ marginRight: 8 }} />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="custom-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary" variant="outlined">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color="secondary"
          variant="contained"
          autoFocus
        > 
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertAgreeDisagree;
