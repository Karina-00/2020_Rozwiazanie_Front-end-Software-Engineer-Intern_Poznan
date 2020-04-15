import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { PokeapiService } from '../_services/pokeapi.service';

class Category {
  name: string;
  arr: any[];
  constructor(name: string, arr: any[]) {
    this.name = name;
    this.arr = arr;
  }
}

class Type {
  name: string;
  url: string;
  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
  }
}

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  @Output() displayFilteredData: EventEmitter<any> = new EventEmitter();
  @ViewChild('search', { static: false }) search: ElementRef;

  categories: any[] = [];
  setOfTypes: any[] = [];
  types: any[] = [];
  alphabet: string[] = [];
  chosen: any[] = [];
  Types = true;
  Letters = true;

  constructor(private pokeapiService: PokeapiService) {}

  ngOnInit() {
    let i;
    this.alphabet = [...Array(26)].map(
      _ => String.fromCharCode(i++).toUpperCase(),
      (i = 97)
    );
  }

  showAlphabet() {
    if (!this.Letters) {
      return 0;
    }
    const letters = this.alphabet.map(letter => {
      return new Type(letter, `/////${letter}`);
    });
    const letterCategory = new Category('Letters', letters);
    this.categories.push(letterCategory);
    this.Letters = false;
  }

  showTypes() {
    if (!this.Types) {
      return 0;
    }
    const types = [];
    this.pokeapiService.getTypes().subscribe(res => {
      const results: any[] = res['results'];
      results.forEach(el => {
        const x = new Type(el.name, el.url);
        types.push(x);
      });
    });
    const type = new Category('Types', types);
    this.categories.push(type);
    this.Types = false;
  }

  clickedType(event) {
    event.target.classList.toggle('marked');
  }

  applyFilters() {
    this.displayFilteredData.emit('filters');
  }

  sortData(val) {
    this.displayFilteredData.emit(val);
  }

  searchPokemon() {
    this.closeFilters();
    const value: string = this.search.nativeElement.value;
    this.displayFilteredData.emit(value.toLowerCase());
  }

  closeFilters() {
    this.closeCategory(0, 'Types');
    this.closeCategory(0, 'Letters');
  }

  closeCategory(i, category) {
    this.categories.splice(i, 1);
    eval(`this.${category} = true`);
  }
}
