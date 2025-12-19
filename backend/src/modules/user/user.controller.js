export async function getMe(req, res) {
  res.json({
    success: true,
    user: req.user,
  });
}