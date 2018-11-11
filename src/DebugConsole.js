
import './DebugConsole.css';

export default class DebugConsole {
    
    defOpts = {
         patch:['log']
        ,maxRows:5
        ,stacked:false
        ,prettyPrint:true
        ,hotKeys:['`']
    }
    
    applyOpts(opts) {
        if ( !opts )
            return this.opts = this.defOpts;
        this.opts = this.defOpts;
        for ( var key in this.defOpts ) {
            this.opts[key] = opts[key] || this.defOpts[key];
        }
    }
    
    constructor(opts) {
        
        this.applyOpts(opts);
        this.create();
        this.history = [];
        
        for ( var func of this.opts.patch ) {
            this[func] = console[func];
            console[func] = this.screen_message.bind(this,func);
        }
        
        console.log('log simple message');
        console.debug("debug simple message");
        console.info("info simple message");
        console.warn("warn simple message");
        console.error('error simple message');
        
        
        console.warn("DebugConsole initialized");
    }

    
    create() {
        
        if ( this.cons  )
            return this.msg;
            
        const createButton = (node,clsName,hint,handler) => {
            var button = document.createElement('div');
            button.className="debug-console-button " + clsName;
            button.setAttribute('title',hint);
            button.onclick = handler;
            node.appendChild(button);
            return button;
        }

        this.cons = document.createElement("div");
        this.cons.className = "debugConsole debugHidden";
        this.cons.id="debugConsole";
        // erf
        this.msg = document.createElement("div");
        this.msg.className = "debug-message";
        this.msg.id = "debug-message";
        this.msg.setAttribute("count",1);
        
        var hk = this.opts.hotKeys.join(',');
        
        var close = createButton(this.cons,'debug-close-button','Close the console',this.onClose.bind(this));
        var clear = createButton(this.cons,'debug-clear-button','Clear the console',this.onClear.bind(this));
        var show  = createButton(this.cons,'debug-minimize-console',`Minimize\n[${hk}] hotkey(s)`,this.onMinimize.bind(this));    
        this.btnRestore = createButton(document.body,'debug-restore-console',`Restore\n[${hk}] hotkey(s))`,this.onRestore.bind(this));    
            
        this.cons.appendChild(this.msg);
        document.body.appendChild(this.cons);
        
        this.animationEnd = this.onEndAnimation.bind(this);
        this.animationEvent = this.whichAnimationEvent();
        
        
        this.cons.addEventListener(this.animationEvent,this.animationEnd);
    
        this.hotKey = this.onKeyUp.bind(this);
        document.body.addEventListener('keyup',this.hotKey);
    
        return this.msg;
    }
    

    onEndAnimation(e) {
        if ( e.animationName === "slideOut" ) {
            this.btnRestore.className="debug-console-button debug-restore-console buttonVisible";
            this.cons.className="debugConsole debugHidden";
        } else {
            this.btnRestore.className="debug-console-button debug-restore-console buttonHidden";
            this.cons.className="debugConsole debugVisible";
       }
    }
    
    onKeyUp(e) {
        console.warn(e);
        if ( this.opts.hotKeys.indexOf(e.key) !== -1 ) { 
            if ( !this.visible ) {
                this.visible = true;
                this.cons.className = "debugConsole showConsole";
            } else {
                this.cons.className = "debugConsole hideConsole";
                this.visible = false;
            }
        } 
    }
    
    onRestore() {
        this.visible = true;
        this.cons.className = "debugConsole showConsole";
    }
    
    onMinimize() {
        this.cons.className = "debugConsole hideConsole";
        this.visible = false;
    }        

    onClose() {
        for ( var rep of this.opts.patch ) {
             console[rep] = this[rep];
        }
        document.body.removeEventListener('keyup',this.hotKey);
        this.cons.removeEventListener(this.animationEvent,this.animationEnd);
        document.body.removeChild(this.cons);
        console.log("DebugConsole removed...");
    }
    
    onClear() {
        var msg = document.getElementById('debug-message');
        this.history = [];
        msg.innerHTML = '';
    }
    
    ////////////////
    screen_message() {
        var level = [].shift.apply(arguments);
        var text = '';
        
        const withType = (msg) => {
            return `<span class="debug-${level}">${msg}</span>`;
        }
        
        const parse = (arg) => {
            if ( Array.isArray(arg)) {
                var ret = '[<i class="debug-console-object">'+arg.constructor.name+'</i>]';
                arg.forEach((item)=>{
                    ret += parse(item) + '&nbsp;';
                });
                return ret;
            } else if ( typeof(arg) === 'object' ) {
                var json = JSON.stringify(arg,null,2);
                return '[<i class="debug-console-object">'+arg.constructor.name+'</i>] ' + withType(json);
            } else {
                return withType(arg);
            }                
        }
        
        for ( var arg of arguments ) {
            if ( text.length > 0 )
                text += '&nbsp';
            text += parse(arg);
        }
        
        var msg = this.msg;
        var count = parseInt(msg.getAttribute("count")) + 1;
        msg.setAttribute("count",count);
        
        var lines = text.split('\n');
        console.warn("SPLT",lines);
        
        if ( this.opts.stacked )
            this.history.unshift(text);
        else
            this.history.push(text);
        
        if ( this.history.length > this.opts.maxRows ) {
            if ( this.opts.stacked )
                    this.history.length = this.history.length - 1;
                else
                    this.history = this.history.slice(-this.opts.maxRows);
        }
        
        var html = this.history.join('<br/>');
        if ( this.opts.prettyPrint )
            msg.innerHTML = '<pre/>'+html+'<pre/>';
        else
            msg.innerHTML = html;
        
        this[level].apply(console,arguments);
    }
    
    whichAnimationEvent(){
      var t,
          el = document.createElement("fakeelement");

      var animations = {
        "animation"      : "animationend",
        "OAnimation"     : "oAnimationEnd",
        "MozAnimation"   : "animationend",
        "WebkitAnimation": "webkitAnimationEnd"
      }

      for (t in animations){
        if (el.style[t] !== undefined){
          return animations[t];
        }
      }
    }    
    
}
