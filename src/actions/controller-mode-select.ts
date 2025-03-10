import { streamDeck, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

//gives your action a unique id
@action({ UUID: "com.ryan-peters.obs-ptz-sync.ptzcontroller" })

//extends the singleAction class adding PtzControllerSettings id property
export class PtzController extends SingletonAction<PtzControllerSettings> {
    //default constructor for testing an event handler from global settings, move to plugin.ts
    constructor() {
        super();
        streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
            //streamDeck.logger.trace("global " + ev.settings.buttonSelected);
        });
    }

    //event fires when the app becomes visible on the stream deck
    override onWillAppear(ev: WillAppearEvent<PtzControllerSettings>): void | Promise<void> {
        //get the latest global settings
        streamDeck.settings.getGlobalSettings()
        //set the titles to all buttons appropriately
        return ev.action.setTitle(`${ev.payload.settings.id ?? ""}`);
    }

    //event fires when the key is pressed
    override async onKeyDown(ev: KeyDownEvent<PtzControllerSettings>): Promise<void> {
        //get the settings from the key
        const { settings } = ev.payload;

        //get all actions from all buttons in this app
        const actions = Array.from(streamDeck.actions);
        //resolve all promises in array and map each promise to dial/key action
        await Promise.all(actions.map(async (actionInstance) => {
            try {
                //get latest settings from the action and create an interlock between all buttons
                const actionSettings = await actionInstance.getSettings();
                
                //check if the id in the action matches the key's id
                if (actionSettings.id === settings.id) {
                    //if it does, set the key to the selected state
                    streamDeck.logger.trace(actionSettings.id + " selected");
                    if(actionInstance.isKey())
                        await actionInstance.setState(1);
                } else {
                    //if it doesn't, set the key to the unselected state
                    if(actionInstance.isKey())
                        await actionInstance.setState(0);
                }
            } catch (error) {
                streamDeck.logger.error("Error getting settings for action: " + error);
            }
        }));
    
        // Perform usual logic
        //await ev.action.setSettings(settings);
        await ev.action.setTitle(`${settings.id}`);
        await streamDeck.settings.setGlobalSettings({
            buttonSelected: settings.id,
        });
        await streamDeck.settings.getGlobalSettings();
    }
}

type PtzControllerSettings = {
    id?: string;
};
