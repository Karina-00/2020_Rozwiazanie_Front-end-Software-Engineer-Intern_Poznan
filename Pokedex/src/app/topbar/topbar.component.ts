import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  // type: string;
  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
    // this.type = type;
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
  Types: boolean = true;
  Letters: boolean = true;

  constructor(
    private pokeapiService: PokeapiService,
    private http: HttpClient
  ) {}

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
    let letters = [];
    this.alphabet.forEach(letter => {
      let x = new Type(letter, `/////${letter}`);
      letters.push(x);
    });
    let y = new Category('Letters', letters);
    this.categories.push(y);
    this.Letters = false;
  }

  showResults(element) {
    let bool = eval(`this.${element}`);
    if (!bool) {
      return 0;
    }
    let types = [];
    let x = eval(`this.pokeapiService.get${element}()`);
    x.subscribe(res => {
      let results: any[] = res['results'];
      results.forEach(el => {
        let x = new Type(el['name'], el['url']);
        types.push(x);
      });
    });
    let y = new Category(element, types);
    this.categories.push(y);
    eval(`this.${element} = false`);
  }

  clickedType(event) {
    event.target.classList.toggle('marked');
  }

  applyFilters() {
    this.displayFilteredData.emit('filters');
  }

  sortData(val) {
    this.closeFilters();
    this.displayFilteredData.emit(val);
  }

  searchPokemon() {
    this.closeFilters();
    let value: string = this.search.nativeElement.value;
    value = value.toLowerCase();
    console.log(value);
    this.displayFilteredData.emit(value);
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
