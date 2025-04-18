export function load({ params }) {
    console.log("Params received:", params);
    return {
        termId: params.id || null,
    };
}