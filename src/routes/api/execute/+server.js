import { json } from 'sveltejs/kit'

export async function POST({ request }) {
    const { code } = await request.json()

    let result;

    try {
        result = eval(code)
    } catch (e) {
        result = e.toString()
    }

    return json({ result })
}