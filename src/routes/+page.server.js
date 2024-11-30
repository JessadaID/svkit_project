import axios from "axios";

export async function load() {
    try {
        const response = await axios.get('https://6749d22a868020296632bdc7.mockapi.io/blogs/user')
        if(response.data){
            return {
                blogs : response.data
            }
        }
    } catch (error) {
        console.log(error)
        return {
            blogs : []
        }
    }
}
