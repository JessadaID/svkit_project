export function load({ params }) {
    console.log(params); // ถ้าเส้นทางไม่มีพารามิเตอร์จะได้ {}
    return {
        id:params.id
    };
}
