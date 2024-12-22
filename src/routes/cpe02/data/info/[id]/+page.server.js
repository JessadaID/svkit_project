export function load({ params }) {
  console.log("Params received:", params);
  return {
      id: params.id || null,
  };
}