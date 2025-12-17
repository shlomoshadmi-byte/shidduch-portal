const handleConfirm = async () => {
  setMessage(null);

 const [token, setToken] = useState<string | null>(null);

const [sessionReady, setSessionReady] = useState(false);
const [sessionMissing, setSessionMissing] = useState(false);

const [loadingPreview, setLoadingPreview] = useState(false);
const [preview, setPreview] = useState<IntakePreview | null>(null);

// 👇 THIS WAS MISSING / MISNAMED
const [message, setMessage] = useState<string | null>(null);

const [confirming, setConfirming] = useState(false);


  if (!token) {
    setMessage("Missing or invalid token in URL.");
    return;
  }

  if (confirming) return; // extra safety
  setConfirming(true);

  try {
    // 1) Claim + get manage_token from RPC (Option A)
    const { data, error } = await supabase.rpc("claim_profile_v2", { token });

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("used") || msg.includes("invalid")) {
        setMessage("This submission was already confirmed ✅ Please check your email for the Manage link.");
      } else {
        setMessage(`Confirm failed: ${error.message}`);
      }
      setConfirming(false);
      return;
    }

    const claimedId = data?.[0]?.id as string | undefined;
    const manageToken = data?.[0]?.manage_token as string | undefined;

    if (!claimedId || !manageToken) {
      setMessage("Confirmed ✅ but could not load manage token. Please contact support.");
      setConfirming(false);
      return;
    }

    // 2) Send Email #2 (server route uses service role)
    const res = await fetch("/api/send-manage-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manage_token: manageToken }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setMessage(`Confirmed ✅ but Email #2 failed (${res.status}): ${txt || "No details"}`);
      setConfirming(false);
      return;
    }

    // 3) Success → redirect
    setConfirming(false);
    router.replace(`/confirmed?manage_token=${encodeURIComponent(manageToken)}`);
  } catch {
    setMessage("Confirmed ✅ but Email #2 failed (network error).");
    setConfirming(false);
  }
};
