使用的是devui.design
```html
<d-button (btnClick)="addWidget()">Add a widget</d-button>
<d-button [bsStyle]="'common'" (btnClick)="deleteWidget(widgets.length - 1)">Delete the last widget</d-button>
<d-dashboard #dashboard="dDashboard" class="dashboard">
  <d-dashboard-widget
    *ngFor="let widget of widgets; let index = index"
    [(x)]="widget.x"
    [(y)]="widget.y"
    [(width)]="widget.width"
    [(height)]="widget.height"
    [minWidth]="widget.minWidth"
    [minHeight]="widget.minHeight"
    [maxWidth]="widget.maxWidth"
    [maxHeight]="widget.maxHeight"
    [locked]="widget.locked"
    [noMove]="widget.noMove || widget.locked"
    [noResize]="widget.noResize || widget.locked"
    [autoPosition]="widget.autoPosition"
    class="widget"
  >
    <div class="index">{{ index + 1 }}</div>
    <div class="content">
      <div>
        <div>
          <span>Coordinates</span><span class="coordinate">{{ widget.x }} , {{ widget.y }}</span>
        </div>
        <div>
          <span>Width & Height</span><span class="size">{{ widget.width }} x {{ widget.height }}</span>
        </div>
        <div *ngIf="widget.locked"><span>Lock position</span></div>
        <div *ngIf="widget.noMove"><span>Lock drag move</span></div>
        <div *ngIf="widget.noResize"><span>Lock drag size</span></div>
      </div>
    </div>
  </d-dashboard-widget>
  <d-dashboard-widget [minWidth]="2" [maxWidth]="5" class="widget">
    <div class="content"><div>Independent use</div></div></d-dashboard-widget
  >
</d-dashboard>
```
```ts
import { Component } from '@angular/core';
import { DashboardWidget } from 'ng-devui/dashboard';

@Component({
  selector: 'd-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})
export class BasicComponent {
  widgets: Array<DashboardWidget> = [{
    x: 0,
    y: 0,
    width: 3,
    height: 2,
  }, {
    x: 3,
    y: 0,
    width: 3,
    height: 1,
  }, {
    x: 6,
    y: 0,
    width: 3,
    height: 1,
    locked: true
  }, {
    x: 3,
    y: 1,
    width: 2,
    height: 1
  }, {
    x: 5,
    y: 1,
    width: 3,
    height: 2
  }, {
    x: 8,
    y: 1,
    width: 1,
    height: 1,
    noMove: true
  }, {
    x: 9,
    y: 1,
    width: 2,
    height: 1
  }, {
    x: 2,
    y: 2,
    width: 3,
    height: 1
  }, {
    x: 8,
    y: 2,
    width: 3,
    height: 1,
    noResize: true
  }, {
    x: 0,
    y: 3,
    width: 3,
    height: 1,
  }, {
    x: 11,
    y: 0,
    width: 1,
    height: 3,
  }, {
    x: 10,
    y: 100,
    width: 2,
    height: 1,
    autoPosition: true
  }, {
    x: 3,
    y: 3,
    width: 9,
    height: 1,
  }];
  log = console.log;
  addWidget() {
    this.widgets.push({width: 2, height: 1});
  }
  deleteWidget(i) {
    if (i < 0 || i >= this.widgets.length) {return; }
    this.widgets.splice(i, 1);
  }
}
```
```scss
@import '~ng-devui/styles-var/devui-var.scss';

.dashboard {
  background-color: $devui-global-bg;
}

d-button {
  display: inline-block;
  margin-bottom: 8px;
  margin-right: 4px;
}

.widget {
  position: relative;

  .index {
    position: absolute;
    font-size: 28px;
    color: $devui-aide-text;
    opacity: 0.5;
    font-weight: bold;
    right: 0.5em;
    top: 0.25em;
  }

  .content {
    font-size: 12px;
    line-height: 28px;
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    color: $devui-text-weak;

    > div {
      columns: 1;
      text-align: center;
      width: 100%;

      > div > span:nth-child(2) {
        display: inline-block;
        margin-left: 8px;
        font-size: 16px;
      }
    }
  }
}
```