import { html, render, useEffect, useRef, useState } from "./imports/Preact.js"
import "./common/NodejsCompatibilityPolyfill.js"

import { Editor, default_path } from "./components/Editor.js"
import { FetchProgress, read_Uint8Array_with_progress } from "./components/FetchProgress.js"
import { BinderPhase } from "./common/Binder.js"
import { unpack } from "./common/MsgPack.js"
import { RawHTMLContainer } from "./components/CellOutput.js"

const url_params = new URLSearchParams(window.location.search)

//////////////
// utils:

const set_attribute_if_needed = (element, attr, value) => {
    if (element.getAttribute(attr) !== value) {
        element.setAttribute(attr, value)
    }
}
export const set_disable_ui_css = (val) => {
    document.body.classList.toggle("disable_ui", val)
    set_attribute_if_needed(document.head.querySelector("link[data-pluto-file='hide-ui']"), "media", val ? "all" : "print")
}

/////////////
// the rest:

/**
 *
 * @type {import("./components/Editor.js").LaunchParameters}
 */
const launch_params = {
    //@ts-ignore
    notebook_id: url_params.get("id") ?? window.pluto_notebook_id,
    //@ts-ignore
    statefile: url_params.get("statefile") ?? window.pluto_statefile,
    //@ts-ignore
    notebookfile: url_params.get("notebookfile") ?? window.pluto_notebookfile,
    //@ts-ignore
    disable_ui: !!(url_params.get("disable_ui") ?? window.pluto_disable_ui),
    //@ts-ignore
    preamble_html: url_params.get("preamble_html") ?? window.pluto_preamble_html,
    //@ts-ignore
    isolated_cell_ids: url_params.has("isolated_cell_id") ? url_params.getAll("isolated_cell_id") : window.pluto_isolated_cell_ids,
    //@ts-ignore
    binder_url: url_params.get("binder_url") ?? window.pluto_binder_url,
    //@ts-ignore
    slider_server_url: url_params.get("slider_server_url") ?? window.pluto_slider_server_url,
    //@ts-ignore
    recording_url: url_params.get("recording_url") ?? window.pluto_recording_url,
    //@ts-ignore
    recording_audio_url: url_params.get("recording_audio_url") ?? window.pluto_recording_audio_url,
}
console.log("Launch parameters: ", launch_params)

/**
 *
 * @returns {import("./components/Editor.js").NotebookData}
 */
export const empty_notebook_state = ({ notebook_id }) => ({
    notebook_id: notebook_id,
    path: default_path,
    shortpath: "",
    in_temp_dir: true,
    process_status: "starting",
    last_save_time: 0.0,
    last_hot_reload_time: 0.0,
    cell_inputs: {},
    cell_results: {},
    cell_dependencies: {},
    cell_order: [],
    cell_execution_order: [],
    published_objects: {},
    bonds: {},
    nbpkg: null,
})

/**
 *
 * @param {{
 *  launch_params: import("./components/Editor.js").LaunchParameters,
 * }} props
 */
const EditorLoader = ({ launch_params }) => {
    const static_preview = launch_params.statefile != null

    const [statefile_download_progress, set_statefile_download_progress] = useState(null)

    const initial_notebook_state_ref = useRef(empty_notebook_state(launch_params))
    const [ready_for_editor, set_ready_for_editor] = useState(!static_preview)

    useEffect(() => {
        if (!ready_for_editor && static_preview) {
            ;(async () => {
                const r = await fetch(launch_params.statefile)
                const data = await read_Uint8Array_with_progress(r, set_statefile_download_progress)
                const state = unpack(data)
                initial_notebook_state_ref.current = state
                set_ready_for_editor(true)
            })()
        }
    }, [ready_for_editor, static_preview, launch_params.statefile])

    useEffect(() => {
        set_disable_ui_css(launch_params.disable_ui)
    }, [launch_params.disable_ui])

    const preamble_element = launch_params.preamble_html ? html`<${RawHTMLContainer} body=${launch_params.preamble_html} className=${"preamble"} />` : null

    return ready_for_editor
        ? html`<${Editor} initial_notebook_state=${initial_notebook_state_ref.current} launch_params=${launch_params} preamble_element=${preamble_element} />`
        : // todo: show preamble html
          html`
              ${preamble_element}
              <${FetchProgress} progress=${statefile_download_progress} />
          `
}

// it's like a Rube Goldberg machine
render(html`<${EditorLoader} launch_params=${launch_params} />`, document.body)
