!function(t){function e(n){if(i[n])return i[n].exports;var r=i[n]={exports:{},id:n,loaded:!1};return t[n].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var i={};return e.m=t,e.c=i,e.p="/static/build/",e(0)}({0:function(t,e,i){function n(t,e){"use strict";s.call(this),this.$RecordStore_title=t,this.$RecordStore_categoryId=e}function r(t){return"/works/"+encodeURIComponent(t)+"/"}function o(){return{title:l.getTitle(),categoryId:l.getCategoryId()}}var s=i(11);for(var a in s)s.hasOwnProperty(a)&&(n[a]=s[a]);var c=null===s?null:s.prototype;n.prototype=Object.create(c),n.prototype.constructor=n,n.__superConstructor__=s,n.prototype.setTitle=function(t){"use strict";this.$RecordStore_title=t,this.emitChange()},n.prototype.getTitle=function(){"use strict";return this.$RecordStore_title},n.prototype.getCategoryId=function(){"use strict";return this.$RecordStore_categoryId},n.prototype.setCategoryId=function(t){"use strict";this.$RecordStore_categoryId=t,this.emitChange()};var l,d=React.createClass({displayName:"TitleEditView",componentDidMount:function(){var t=initTypeahead(this.refs.titleInput.getDOMNode());t.on("keypress",function(t){13==t.keyCode&&this.handleSave()}.bind(this))},render:function(){return React.DOM.div({className:"title-form"},React.DOM.input({ref:"titleInput",defaultValue:this.props.originalTitle}),React.DOM.button({onClick:this.handleSave},"저장")," ",React.DOM.a({href:"#",onClick:this.handleCancel},"취소"))},handleSave:function(){this.props.onSave(this.refs.titleInput.getDOMNode().value)},handleCancel:function(t){t.preventDefault(),this.props.onCancel()}}),p=React.createClass({displayName:"CategoryEditView",render:function(){var t="지정 안함";return this.props.selectedId&&(t=this.props.categoryList.filter(function(t){return t.id==this.props.selectedId}.bind(this))[0].name),React.DOM.span({className:"category-form btn"},React.DOM.label(null,"분류: "),t," ▼",React.DOM.select({value:this.props.selectedId,onChange:this.handleChange},React.DOM.option({value:""},"지정 안함"),this.props.categoryList.map(function(t){return React.DOM.option({value:t.id},t.name)})))},handleChange:function(t){this.props.onChange(t.target.value)}}),h=React.createClass({displayName:"HeaderView",getInitialState:function(){return{isEditingTitle:!1}},render:function(){var t;return t=this.state.isEditingTitle?d({recordId:this.props.recordId,originalTitle:this.props.title,onSave:this.handleTitleSave,onCancel:function(){return this.setState({isEditingTitle:!1})}.bind(this)}):[React.DOM.h1(null,React.DOM.a({href:r(this.props.title),className:"work"},this.props.title)),React.DOM.a({href:"#",className:"btn btn-edit-title",onClick:this.handleTitleEditButtonClick},"제목 수정")],React.DOM.div({className:"record-detail-header"},t,React.DOM.a({href:"/records/"+this.props.recordId+"/delete/",className:"btn btn-delete"},"삭제"),p({categoryList:this.props.categoryList,selectedId:this.props.categoryId,onChange:this.handleCategoryChange}))},handleTitleEditButtonClick:function(t){t.preventDefault(),this.setState({isEditingTitle:!0})},handleTitleSave:function(t){$.post("/records/"+this.props.recordId+"/update/title/",{title:t}).then(function(){l.setTitle(t),this.setState({isEditingTitle:!1})}.bind(this))},handleCategoryChange:function(t){$.post("/records/"+this.props.recordId+"/update/category/",{category:t}).then(function(){l.setCategoryId(t)})}}),u=React.createClass({displayName:"AppView",getInitialState:function(){return o()},_onChange:function(){this.setState(o())},componentDidMount:function(){l.addChangeListener(this._onChange)},render:function(){return h({recordId:this.props.recordId,title:this.state.title,categoryId:this.state.categoryId,categoryList:this.props.categoryList})}});l=new n(APP_DATA.title,APP_DATA.categoryId),React.renderComponent(u(APP_DATA),$(".library-container")[0]),$(document).ajaxError(function(t,e){if(e.responseText)try{var i=$.parseJSON(e.responseText);return void alert(i.message)}catch(n){}alert("서버 오류로 요청에 실패했습니다.")})},11:function(t){function e(){"use strict";this.$BaseStore_listeners=[]}e.prototype.addChangeListener=function(t){"use strict";this.$BaseStore_listeners.push(t)},e.prototype.removeChangeListener=function(t){"use strict";this.$BaseStore_listeners=this.$BaseStore_listeners.filter(function(e){return e!=t})},e.prototype.emitChange=function(t){"use strict";this.$BaseStore_listeners.forEach(function(e){return e(t)})},t.exports=e}});