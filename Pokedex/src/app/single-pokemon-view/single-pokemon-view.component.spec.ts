import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglePokemonViewComponent } from './single-pokemon-view.component';

describe('SinglePokemonViewComponent', () => {
  let component: SinglePokemonViewComponent;
  let fixture: ComponentFixture<SinglePokemonViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinglePokemonViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SinglePokemonViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
