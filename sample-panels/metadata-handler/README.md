# Metadata Handler Panel 
A sample panel we developed to improve user's control over project item metadata handling :)

## Things you need to begin
- Premiere Pro 25.2.0 BETA (Build 13) or later, available through Creative Cloud Desktop (CCD)
- UXP Developer Tool-UDT, Version 2.1.0 (2.1.0.30) which is available for download through [Creative Cloud Desktop](https://creativecloud.adobe.com/apps/download/uxp-developer-tools) (CCD)

## Set Up
- Open your console / terminal / command prompt
- cd into the `sample-panels/metadata-handler` directory
- Open the UDT tool and add this new plugin by selecting ```manifest.json``` under the metadata-handler directory 
<img width="600" alt="Screenshot 2024-12-17 at 9 21 07 AM" src="https://git.corp.adobe.com/storage/user/57827/files/affa011d-5f1e-45e0-916f-d71a7f8bfba7">

- Load panel from UDT and have fun playing with it!
<img width="600" alt="Screenshot 2024-12-17 at 9 22 50 AM" src="https://git.corp.adobe.com/storage/user/57827/files/249db66d-9a8c-4ac7-9531-0081ba7336af">

## Preview and Known Issues
<img width="699" alt="Screenshot 2025-01-06 at 4 32 17 PM" src="https://git.corp.adobe.com/storage/user/57827/files/00636040-eca0-4207-9b9c-dec617cf8ff1">

1. Right now, doing a set of update project metadata action via compound action could pollute history panel with list of update message instead of a single message, which was not intended. We have started investigating into the bug.
2. Due to the same bug, you can't undo two set of update metadata actions. 
3. Due to the same bug and the limit of history panel is 10000, if you update over this number of project items' metadata, you will not be able to undo all of them. 


## Special Thanks
Kudos to Fran's CEP Panel, where we get the inspiration of developing a UXP Panel that could improve 
control over metadata. From there, we redesigned the UI and expanded functionalities to make this UXP Panel.We hope this could be a good sample indicating how we were able to transfer CEP panel to a UXP Panel with more intuitive UI and functionalities. 