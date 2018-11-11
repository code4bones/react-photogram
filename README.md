


## react-photogram

![version]

- [Screenshots](#screenshots)
- [Installation](#installation)
  - [Importing](#importing)
	  - with debug console
- Properties
- Methods

# Screenshots

| **Inplace** mode | with "debug" option is set  |
|--|--|
|![inplace]|![inplace-debug]|
| **Dialog mode** |   |
|![dialog]|![dialog-debug]|



## Installation
```shell
	npm install --save react-photogram
```
## Importing
```js
	import ReactPhotogram from 'react-photogram'
```
 or with <`DatGuiObject`/> (for using with debug console based on *react-dat-gui* component)
```js
	import ReactPhotogram,{DatGuiObject} from 'react-photogram'
```

## Usage
### Inplace
```js
class InplacePhoto extends Component {
    
    state = {
         visible:false
        ,image:avatar
        ,mode:1
        ,cameraWidth:400
        ,outputSize:{width:'120px',height:'120px'}
        ,thumbnailSize:{width:64,height:64,photosPerLine:3,wide:400}
        ,mute:false
        ,debug:true
    }
    
    conf = {
         menu:{vAlign:'bottom',hAlign:'middle'}
        ,lockAspectRatio:false
        ,noLocalStorage:false    
        ,resetOnClose:false
        ,snapKeys:['Space','Enter']
    }
    
    constructor(props) {
        super(props);
        this.image = React.createRef();
    }
    
    componentDidMount() {
        console.log("Demo",this);
    }
  
    photoDlg = () => {
        this.setState({visible:true});
    }
    
    onError = (error) => {
        console.log("Error from component:",error);
    }
    
    onOk = (item) => {
        this.setState({visible:false});
    }        
    
    onSelectThumbnail = (item) => {
        //console.log("onChange",item);
        this.setState({image:item.image,outputSize:item.size});
    }
    
    onImage = (data) => {
        console.log("onImage",data);
        this.setState({image:data.output.dataURL,outputSize:data.output.size});
    }
    
    onModeChange = ev => {
        this.setState({mode:ev.target.value});
        
    }
    
    onDebug(ev) {
        console.log(ev);
        this.setState({debug:ev.target.checked});
    }
    
    onDatFormat(path,value) {
        //console.log(`Format ${path} = ${value}`);
        switch ( path ) {
            case 'thumbnailSize.width':
            case 'thumbnailSize.height':
            case 'outputSize.width':
            case 'outputSize.height':
                return parseInt(value) + 'px';
            case 'level.level1.text':
                return 'mutate -> '+value;
        }
        return value;
    }
    
    onDatUpdate(data) {
        console.log('onDatUpdate',data);
        
        //MutateObject(data,this.onDatFormat.bind(this));
        
        this.setState({cameraWidth:data.cameraWidth,
                       videoWidth:data.cameraWidth,
                       videoHeight:data.cameraWidth * 0.75,
                       outputSize:data.outputSize,
                       thumbnailSize:data.thumbnailSize,
                       mode:parseInt(data.mode),
                       mute:data.mute});
    }
    
    onIsVisible(path) {
        switch ( path ) {
            case 'visible':
            case 'debug':
            case 'image':
            case 'videoWidth':
            case 'videoHeight':
                return false;
            case 'thumbnailSize':
                return this.state.mode === 2?true:false
        }
        return true;
    }
    
    getCustom(path) {
        switch ( path ) {
            case 'outputSize.width':
            case 'outputSize.height':
                return {type:'number',min:0,max:600,step:1}
            case 'thumbnailSize.width':
            case 'thumbnailSize.height':
                return {type:'number',min:16,max:200,step:1}
            case 'thumbnailSize.wide':
                return {type:'number',min:100,max:800,step:1}
            case 'thumbnailSize.photosPerLine':
                return {type:'number',min:1,max:10,step:1}
            case 'cameraWidth':
                return {type:'number',min:120,max:1080,step:1}
            case 'mode': 
                return {type:'select',options:[1,2]}
            default:
                return false;
        }
    }
    
  render() {
    return (
        <div style={{margin:'10px 10px 10px 10px'}}>

            <h1>react-photogram Demo</h1>
            <Checkbox checked={this.state.debug} onChange={this.onDebug.bind(this)}>Debug Mode</Checkbox>
            <Radio.Group onChange={this.onModeChange} value={this.state.mode}>
                <Radio value={1}>Inplace (Simple)</Radio>
                <Radio value={2}>Dialog mode (Complex)</Radio>
            </Radio.Group>
            {this.state.mode===2?
                <Button type="primary" onClick={this.photoDlg.bind(this)}>Show Photo Dialog</Button>
            :''}            
            <br />
            <img {...this.state.outputSize} src={this.state.image} ref={this.image} alt="Shot" id="preview" style={{paddingTop:'10px'}}/>
            <ReactPhotogram 
                       {...this.conf}
                       debug={this.state.debug}
                       mute={this.state.mute}
                       outputSize={this.state.outputSize}
                       thumbnailSize={this.state.thumbnailSize}
                       cameraWidth={this.state.cameraWidth}
                       dialog={this.state.mode === 2}
                       visible={this.state.visible}
                       onOk={this.onOk}
                       onSelectThumbnail={this.onSelectThumbnail}
                       onError={this.onError}
                       onImage={this.onImage}
                       title="Take a photos" >
                       
                    {this.state.debug?
                        <DatGuiAuto labelWidth={40} 
                                    data={this.state} 
                                    onUpdate={this.onDatUpdate.bind(this)} 
                                    isVisible={this.onIsVisible.bind(this)}
                                    getCustom={this.getCustom.bind(this)}
                                    ranges={{min:1,max:4000,step:1}}
                                    
                        >
                        </DatGuiAuto>:''}
            </ReactPhotogram>
                       
                       
            </div>
            
    )
  }
}

``

[dialog]: https://i.imgur.com/m6eocT4.png
[dialog-debug]: https://i.imgur.com/WT2LBzw.png

[inplace]: https://i.imgur.com/IyGkGp6.png
[inplace-debug]: https://i.imgur.com/0TO7pRH.png


[version]: https://img.shields.io/badge/dynamic/json.svg?label=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fcode4bones%2Freact-photogram%2Fmaster%2Fpackage.json&query=%24.version&colorB=blue



