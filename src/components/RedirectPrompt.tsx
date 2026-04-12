import React, { useEffect, useRef } from "react";

interface Props {
  targetPath: string | null;
  onAccept: () => void;
  onDismiss: () => void;
}

const RedirectPrompt: React.FC<Props> = ({ targetPath, onAccept, onDismiss }) => {
  const firedRef = useRef<string | null>(null);

  useEffect(() => {
    if (targetPath && targetPath !== firedRef.current) {
      firedRef.current = targetPath;
      onAccept();
    }
    if (!targetPath) {
      firedRef.current = null;
    }
  }, [targetPath, onAccept]);

  return null;
};

export default RedirectPrompt;
