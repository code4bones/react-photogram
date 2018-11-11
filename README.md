


## react-photogram

![version]

- [Screenshots](#screenshots)
- [Installation](#installation)
  - [Importing](#importing)
- [Properties](#properties)
	- [CameraView](#cameraview)
	- [WithThumbnailBox](#withthumbnailbox)
- Methods

## Screenshots

| Using <`WithThumbnailsBox` /> HOC | Simple <`CameraView`/>  |
|--|--|
|![inplace]|![simple]|
| **Embedded** to dialog |   |
|![dialog]||



## Installation
```shell
	npm install --save react-photogram
```
## Importing
```js
	import CameraView,{WithThumbnailsBox} from 'react-photogram'
```

## ***<`CameraView/`>***
#### Properties
|Name|type|Description|
|--|--|--|
| cameraWidth | int  | device resolution,translates into video width = cameraWidth,video height = cameraWidth * 0.75  |
|livePreview|bool|fires ```onLinePreview(imageURL)``` 
|noLocalStorage|bool|saves the crop box to local storage
|snapKeys|array of strings|maps a specefied keys to make a snaphot,like as ``KeyboadEvent.code`` like ['Space','Enter']
|button:{<br/>vAlign:"val",<br/> hAlign:"val"<br/>}|object{string,string}|Snap button alignment,can be of ``middle,top,left,right,bottom`` for vAlign and hAlign
|mute|bool|Disables the shutter sound
|outputSize:{<br/>width:num,<br/>height:num<br/>}|object{int,int}|translates actual cropping size into that width and height
|||
|||
|||
|||
#### Methods
|Name|Description|
|--|--|
|onImage([imageObj](#imageObj))|fires on button clicked/hotkey pressed
|onLivePreview(dataURL)|streaming cropped picture for preview

## ***<`WithThumbnailsBox/`>***
#### Properties 
>*Extends <`CameraView`/> props with folowwing props:*

|Name|type|Description|
|--|--|--|
|thumbnailSize:{<br/>width:*num*<br/>height:*num*<br/>thumbsPerLine:*num*<br/>}|object(int,int,int)|Sets thumbnails dimension,and thumbs per line on thumbnails box view
|||
|||


[dialog]: https://i.imgur.com/rHcFWEA.png
[inplace]: https://i.imgur.com/6a6A5Ng.png
[simple]: https://i.imgur.com/fbV0dov.png


[version]: https://img.shields.io/badge/dynamic/json.svg?label=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fcode4bones%2Freact-photogram%2Fmaster%2Fpackage.json&query=%24.version&colorB=blue



