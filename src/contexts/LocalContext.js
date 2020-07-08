import { createContext } from "react"

/**
 * This function is a context for localization purposes.
 */
const LocalContext = createContext([
    { local: "fa" },
    obj => obj
])

export default LocalContext