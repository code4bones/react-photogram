import React,{Component} from 'react';
import _ from 'lodash';
import isColorStop from 'is-color-stop';
import DatGui,{DatNumber,DatFolder,DatBoolean,DatString,DatColor,DatButton,DatSelect} from 'react-dat-gui';
import 'react-dat-gui/build/react-dat-gui.css';
import './DatGuiAuto.css';

const DatGuiAuto = (props) => {
    
    const createFolder = (key,val,path) =>  {
        return <DatFolder key={key} closed={false} title={key} children={parse(val,path)} />
    }
    
    const createValue = (key,val,path,obj) => {
        var p = path?path+'.'+key:key;
        var label = key;
        if ( props.isVisible && !props.isVisible(p) )  {
            return false;
        }   
     
        var custom = props.getCustom?props.getCustom(p,val):false;
        if ( custom ) {
            switch ( custom.type  ) {
                case 'number' : return <DatNumber key={p} path={p} label={label} {...custom}/>
                case 'bool' : return  <DatBoolean key={p} path={p} label={label} />
                case 'color': return <DatColor key={p} path={p} label={label} />
                case 'button': return <DatButton key={p} {...custom} />
                case 'select': return <DatSelect key={p} path={p} {...custom} />
            }
        } else {
            var isnum = _.isFinite(parseInt(val)) || _.isFinite(parseFloat(val));  
            if ( isnum ) {
                return <DatNumber key={p} path={p} label={label} {...props.ranges}/>
            } else if ( _.isBoolean(val) )
                return <DatBoolean key={p} path={p} label={label} />
            else if ( isColorStop.isColor(val) )
                return <DatColor key={p} path={p} label={label} />
        }
        return <DatString key={p} path={p} label={label} />
    }
    
    const parse = (obj,path) => {
        var res = [];
        for ( var key in obj ) {
            var val = obj[key];
            if ( _.isObject(val) ) {
                var p = path?path+'.'+key:key;
                if ( props.isVisible && props.isVisible(p) ) {
                    var folder = createFolder(key,val,p); 
                    res.push(folder);
                }
            } else {
                var value = createValue(key,val,path,obj); 
                if ( value )
                    res.push(value);
            }   
        }
        return res;
    }
    return (<DatGui data={props.data} 
                    labelWidth={props.labelWidth?props.labelWidth:40}
                    onUpdate={props.onUpdate}
                    style={props.style||{}}
            >
                {parse(props.data)}
                {props.children}
            </DatGui>)
}

const MutateObject = (initData,cb) => {
        
        
        const applyMutate = (data) => {
            
            const mutate = (key,val,path,obj) => {
                var p = path?path+'.'+key:key;
                obj[key] = cb(p,val);
                return val;
            }
            
            const parse = (obj,path) => {
                var res = [];
                for ( var key in obj ) {
                    var val = obj[key];
                    if ( _.isObject(val) ) {
                        var p = path?path+'.'+key:key;
                        parse(val,p);
                    } else {
                        mutate(key,val,path,obj);
                    }   
                }
                return res;
            }
            parse(data);
        }
        
        applyMutate(initData);
}

export {MutateObject}

export default DatGuiAuto;




