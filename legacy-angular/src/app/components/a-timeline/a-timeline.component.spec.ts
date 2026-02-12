import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ATimelineComponent } from './a-timeline.component';

describe('ATimelineComponent', () => {
  let component: ATimelineComponent;
  let fixture: ComponentFixture<ATimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ATimelineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ATimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
