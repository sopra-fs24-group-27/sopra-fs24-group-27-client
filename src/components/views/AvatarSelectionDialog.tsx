import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Avatar,
  DialogActions,
  Button,
} from "@mui/material";

const avatars = [
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_2.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_3.png",

  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_4.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_26.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_19.png",

  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_12.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_13.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_21.png",

  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_17.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_15.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_16.png",
];
interface AvatarSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
  onConfirm: (avatar: string | null) => void;
}

const AvatarSelectionDialog: React.FC<AvatarSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
  onConfirm,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleAvatarClick = (avatar) => {
    setSelectedAvatar(avatar);
    //onSelect(avatar);
  };

  const handleConfirm = () => {
    onConfirm(selectedAvatar);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: "rgba(235, 200, 255, 0.8)",
          borderRadius: "50px 50px 50px 50px",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "white",
          textAlign: "center",
        }}
      >
        Select an Avatar
      </DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ paddingLeft: 8 }}
        >
          {avatars.map((avatar) => (
            <Grid item xs={4} key={avatar}>
              <Avatar
                src={avatar}
                sx={{
                  width: 60,
                  height: 60,
                  cursor: "pointer",
                  border:
                    selectedAvatar === avatar ? "2px solid purple" : "none",
                  borderRadius: "50%",
                }}
                onClick={() => handleAvatarClick(avatar)}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={!selectedAvatar}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarSelectionDialog;
