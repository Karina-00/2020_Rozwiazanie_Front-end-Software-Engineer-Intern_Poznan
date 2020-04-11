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
  id: number;
  type: string;
  constructor(name: string, url: string, id: number, type: string) {
    this.name = name;
    this.url = url;
    this.id = id;
    this.type = type;
  }
}

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  @Output() displayFilteredData: EventEmitter<any> = new EventEmitter();

  public categories: any[] = [];
  public setOfTypes: any[] = [];
  public types: any[] = [];
  public chosen: any[] = [];
  public Types: boolean = true;
  public Eggs: boolean = true;

  constructor(
    private pokeapiService: PokeapiService,
    private http: HttpClient
  ) {}

  ngOnInit() {}

  showResults(element) {
    let bool = eval(`this.${element}`);
    if (!bool) {
      return 0;
    }
    let types = [];
    let x = eval(`this.pokeapiService.get${element}()`);
    x.subscribe(res => {
      let results: any[] = res['results'];
      let i = 1;
      results.forEach(el => {
        let x = new Type(el['name'], el['url'], i, element);
        types.push(x);
        i++;
      });
    });
    console.log(types);
    let y = new Category(element, types);
    this.categories.push(y);
    eval(`this.${element} = false`);
  }

  clickedType(event) {
    event.target.classList.toggle('marked');
  }

  applyFilters() {
    let x = document.querySelectorAll('.marked');
    x.forEach(el => {
      let url = el.getAttribute('id');
      let type = el.getAttribute('id').split('/')[5];
      this.chosen.push([url, type]);
    });
    this.displayFilteredData.emit(this.chosen);
  }
}
