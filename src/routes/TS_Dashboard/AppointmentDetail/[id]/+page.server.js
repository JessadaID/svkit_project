export function load({ params }) {
    console.log("Params received:", params);
    return {
        Id: params.id || null,
    };
}