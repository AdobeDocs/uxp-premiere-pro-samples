# Metadata Handler Panel 
A sample panel we developed to improve user's control over project item metadata handling :)

## Things you need to begin
- Premiere Pro 25.2.0 BETA (Build 13) or later, available through Creative Cloud Desktop (CCD)
- UXP Developer Tool-UDT, Version 2.1.0 (2.1.0.30) which is available for download through [Creative Cloud Desktop](https://creativecloud.adobe.com/apps/download/uxp-developer-tools) (CCD)

## Set Up
- Open your console / terminal / command prompt
- cd into the `sample-panels/metadata-handler` directory
- Open the UDT tool and add this new plugin by selecting ```manifest.json``` under the metadata-handler directory 
<img width="800" alt="Screenshot 2025-03-07 at 2 52 41 PM" src="https://github.com/user-attachments/assets/55739aed-28dc-4531-8d05-d7e98e42280a" />

- Load panel from UDT and have fun playing with it!
<img width="800" alt="Screenshot 2025-03-07 at 2 53 52 PM" src="https://github.com/user-attachments/assets/7aae497d-6664-4952-bc8a-27497fdda91e" />

## Preview and Known Issues
<img width="714" alt="Screenshot 2025-03-07 at 2 55 15 PM" src="https://github.com/user-attachments/assets/fc82e968-544e-4d0d-b975-d8dc748ce2ff" />

1. Right now, doing a set of update project metadata action via compound action could pollute history panel with list of update message instead of a single message, which was not intended. We have started investigating into the bug.
2. Due to the same bug, you can't undo two set of update metadata actions. 
3. Due to the same bug and the limit of history panel is 10000, if you update over this number of project items' metadata, you will not be able to undo all of them. 


## Special Thanks
Kudos to Fran's CEP Panel, where we get the inspiration of developing a UXP Panel that could improve 
control over metadata.

We hope this could be a good sample indicating how we were able to transfer CEP panel to a UXP Panel with more intuitive UI and functionalities. Have fun!
