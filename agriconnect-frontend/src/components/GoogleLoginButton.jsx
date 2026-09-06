import { useEffect, useRef } from "react";
import { googleLoginUser } from "../api/authApi";

function GoogleLoginButton({ role, onSuccess, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const renderGoogleButton = () => {
      if (!window.google) {
        console.error("Google Identity Services script not loaded.");
        return;
      }

      if (!buttonRef.current) {
        console.error("Google button container not found.");
        return;
      }

      // Clear old Google button
      buttonRef.current.innerHTML = "";

      // Your Google Web Client ID
      const clientId =
        "655567649384-c5rdossoot8plcrvku6fftkm0c9hf036.apps.googleusercontent.com";

      console.log("Google Client ID:", clientId);

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: async (response) => {
          try {
            console.log("Google authentication successful");
            console.log("Sending Google ID token to backend...");

            const result = await googleLoginUser({
              idToken: response.credential,
              role: role || null,
            });

            console.log("Backend Google authentication successful");

            onSuccess(result.data);
          } catch (error) {
            console.error(
              "Google backend authentication error:",
              error
            );

            const message =
              error.response?.data ||
              "Google authentication failed";

            onError(message);
          }
        },
      });

      // Display Google button
      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: "outline",
          size: "large",
          width: 350,
          text: "continue_with",
          shape: "rectangular",
        }
      );
    };

    // Google script already loaded
    if (window.google) {
      renderGoogleButton();
      return;
    }

    // Wait for Google script to load
    const timer = setInterval(() => {
      if (window.google) {
        clearInterval(timer);
        renderGoogleButton();
      }
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [role, onSuccess, onError]);

  return (
    <div
      ref={buttonRef}
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "15px",
        marginBottom: "15px",
      }}
    />
  );
}

export default GoogleLoginButton;