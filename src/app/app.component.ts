import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import {MatListItem, MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  styles: ['canvas { border-style: solid }']
})
export class AppComponent{

  @ViewChild('deletebtn') deleteButton!: MatListItem;
  private contextMenu! : HTMLDivElement;

  private editingObject?: fabric.Object[];
  private fabricCanvas!: fabric.Canvas;
  private selectedTarget?: fabric.Object | null;
  private selectedX!: number;
  private selectedY!: number;

  ngOnInit(): void {
    this.contextMenu = <HTMLDivElement>document.getElementById('contextMenuObject');
    this.fabricCanvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: false,
      preserveObjectStacking: true,
      height: window.innerHeight,
      width: window.innerWidth,
      fireRightClick: true,
      fireMiddleClick: true,
      stopContextMenu: true
    });
    let fabricCanvas: fabric.Canvas = this.fabricCanvas;
    this.handleCanvasEvent(this.fabricCanvas);
    
    fabric.util.addListener(document.getElementsByClassName('upper-canvas')[0] as HTMLCanvasElement, 'contextmenu', function(e: { preventDefault: () => void; }) {
      e.preventDefault();  
    });
  }
  createNote(){
    let rect = new fabric.Rect({
      top: this.selectedY,
      left: this.selectedX,
      width: 150,
      height: 150,
      fill : "red"
    })

    let text = new fabric.IText('Text', {
      fontSize: 30,
      top: rect.top! + rect.getScaledHeight()/2,
      left: rect.left! + rect.getScaledWidth()/2,
      originX: 'center',
      originY: 'center'
    });
    this.packup([rect, text]);
    this.selectedTarget = null
    this.hideMenu();
  }
  handleCanvasEvent(fabricCanvas: fabric.Canvas){
    fabricCanvas.on('mouse:up', (e) => { 
      this.selectedX = e.absolutePointer!.x;
      this.selectedY = e.absolutePointer!.y;
      if(this.contextMenu.style.display === 'block'){
        this.rightClick(e)
      } 
      if(e.button === 3){
        if(e.target === null) this.contextMenu = <HTMLDivElement>document.getElementById('contextMenuCanvas');
        if(e.target !== null) this.contextMenu = <HTMLDivElement>document.getElementById('contextMenuObject');
        this.rightClick(e);
      }
      if(e.target || this.editingObject === undefined) return;
      if(e.button === 1){
        let edit_itext = <fabric.IText>this.editingObject![1]
        edit_itext.exitEditing();
        this.packup(this.editingObject!);
        this.editingObject = undefined
      }
      
    });
  }
  cleanCanvas(): void {
    this.editingObject = undefined
    this.fabricCanvas.clear();
  }
  hideMenu() {
    this.contextMenu.style.display = "none"
  }

  
  rightClick(e: fabric.IEvent) {
    if (this.contextMenu.style.display == "block"){
      this.selectedTarget = null
      this.hideMenu();
    }
    else {
      if(e.target !== null) this.selectedTarget = e.target!;
      let menu = this.contextMenu;
      menu.style.display = 'block';
      menu.style.position = 'absolute'
      menu.style.left = (e.absolutePointer!.x+10) + "px";
      menu.style.top =  (e.absolutePointer!.y ) + "px";
    }
  }

  handleGroupEvent(group: fabric.Group){
    group.on('mousedblclick', (e) => {
      this.ungroup(group);
    })
  }

  ungroup(group: fabric.Group){
    let items = group._objects;
    group._restoreObjectsState();
    this.fabricCanvas.remove(group);
    for (let i = 0; i < items.length; i++) {
      this.fabricCanvas.add(items[i]);
      items[i].lockMovementX = true;
      items[i].lockMovementY = true;
      items[i].lockRotation = true;
      items[i].lockScalingX = true;
      items[i].lockScalingY = true;
    }
    let item_rect = <fabric.Rect>items[0];
    let item_itext = <fabric.IText>items[1];
    item_rect.selectable = false;
    item_itext.enterEditing();
    this.editingObject = items
    this.fabricCanvas.renderAll();
  }
  packup(items: fabric.Object[]){
    items.forEach(item => {
      item.lockMovementX = false;
      item.lockMovementY = false;
      item.lockRotation = false;
      item.lockScalingX = false;
      item.lockScalingY = false;
    });
    let group = new fabric.Group(items, {
      left: items[0].left,
      top: items[0].top,
      angle: 0,
      subTargetCheck: true
    });
    this.handleGroupEvent(group)
    this.fabricCanvas.add(group)
  }
  
  delete(){
    this.fabricCanvas.remove(this.selectedTarget!);
    this.selectedTarget = null;
    this.hideMenu();
  }
  sendToBack(){
    this.fabricCanvas.sendToBack(this.selectedTarget!);
    this.selectedTarget = null;
    this.hideMenu();
  }
  bringToFront(){
    this.fabricCanvas.bringToFront(this.selectedTarget!);
    this.selectedTarget = null;
    this.hideMenu();
  }
}


