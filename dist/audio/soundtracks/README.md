# MPGA Local Soundtracks Directory

Place your downloaded Suno AI MP3 files (or any royalty-free background music files) in this directory.

## How to use:
1. In Suno, click the **... (More Actions)** menu next to your song -> **Download** -> **Audio (.mp3)**.
2. Save the file into this folder, for example: `speakeasy.mp3` or `midnight-dust.mp3`.
3. In `src/data/soundtracks.js`, set the track URL to the local path:
   ```javascript
   {
     id: 'lobby-1',
     title: 'Midnight in the Speakeasy',
     artist: 'Ali Heristchian',
     url: '/audio/soundtracks/speakeasy.mp3',
     volumeMultiplier: 0.7
   }
   ```
4. The audio will play with zero lag, work offline, and never be blocked by external CDN policies!
