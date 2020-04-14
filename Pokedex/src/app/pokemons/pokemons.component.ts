import { Component, OnInit } from '@angular/core';
import { PokeapiService } from '../_services/pokeapi.service';
import { HttpClient } from '@angular/common/http';

class View {
  img: string;
  name: string;
  id: string;
  num: number;
  type: any[];
  eggs: any[] = null;

  constructor(
    name: string,
    id: string,
    num: number,
    img: string,
    type: any[],
    eggs: any[] = null
  ) {
    this.name = name;
    this.id = id;
    this.num = num;
    this.img = img;
    this.type = type;
    this.eggs = eggs;
  }
}

@Component({
  selector: 'app-pokemons',
  templateUrl: './pokemons.component.html',
  styleUrls: ['./pokemons.component.scss'],
})
export class PokemonsComponent implements OnInit {
  pokemons: any[];
  currentPokemons: any[] = [];
  next: string;
  first: string = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=12';
  previous: string;
  currentUrl: string;
  last: string = 'https://pokeapi.co/api/v2/pokemon?offset=800&limit=12"';
  loading: boolean = false;
  eggs: object[] = [];
  err: boolean = false;
  sorting: boolean = false;
  currentTop: number = 12;
  currentBottom: number = 0;
  maxValue: number;
  maxPage: number;

  constructor(
    private pokeapiService: PokeapiService,
    private http: HttpClient
  ) {}

  public defaultUrl: string = `${this.pokeapiService.urlTemplate}pokemon/?limit=12&offset=0`;

  ngOnInit() {
    this.initialPokemonsLoad(this.defaultUrl);
  }

  initialPokemonsLoad(url: string) {
    this.sorting = false;
    this.err = false;
    this.loading = true;
    this.currentPokemons = [];
    this.pokeapiService.getPokemons(url).subscribe(val => {
      this.pokemons = val['results'];
      this.previous = val['previous'];
      this.next = val['next'];
      if (this.next >= this.last) {
        this.next = this.last;
        this.pokemons = this.pokemons.slice(0, 7);
      }
      this.pokemons.forEach(el => {
        this.http.get(el['url']).subscribe(res => {
          this.createPokemonCard(res);
        });
      });
    });
    this.loading = false;
  }

  createPokemonCard(pokemon: object) {
    let types = [];
    pokemon['types'].forEach(element => {
      types.push(element.type.name);
    });
    let num = this.threeDigitNumber(pokemon['id']);
    let photo = this.pokeapiService.getphoto(num);
    let set = new View(pokemon['name'], num, pokemon['id'], photo, types);
    this.currentPokemons.push(set);
    this.sortBy('num');
  }

  threeDigitNumber(num: number) {
    let n = num.toString();
    n = n.padStart(3, '0');
    return n;
  }

  sortBy(prop: string) {
    return this.currentPokemons.sort((a, b) =>
      a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1
    );
  }

  goToUrl(url: string) {
    this.initialPokemonsLoad(url);
  }

  searchPokemon(urlValue: string) {
    this.err = false;
    this.currentPokemons = [];
    if (urlValue === '') {
      return this.initialPokemonsLoad(this.defaultUrl);
    }
    this.pokeapiService.getPokemon(urlValue).subscribe(
      res => {
        this.createPokemonCard(res);
      },
      err => (this.err = true)
    );
  }

  displaySorted(val) {
    this.loading = true;
    this.sorting = true;
    this.pokemons = [];
    this.currentPokemons = [];
    this.currentBottom = 0;
    this.currentTop = 12;
    if (val === 'nameAsc') {
      this.nameSorted(2, 'name');
    } else if (val === 'nameDesc') {
      this.nameSorted(1, 'name');
    } else if (val === 'indexAsc') {
      this.initialPokemonsLoad(this.defaultUrl);
    } else {
      this.nameSorted(1, 'id');
    }
  }

  nameSorted(num: number, key: string) {
    const promises = [];
    for (let i = 1; i <= 807; i++) {
      const url = `${this.pokeapiService.urlTemplate}pokemon/${i}`;
      promises.push(fetch(url).then(res => res.json()));
    }
    Promise.all(promises).then(results => {
      this.pokemons = results
        .map(result => ({
          img: this.pokeapiService.getphoto(this.threeDigitNumber(result.id)),
          name: result.name,
          id: result.id,
          num: this.threeDigitNumber(result.id),
          type: result.types.map(type => type.type.name),
        }))
        .sort((a, b) =>
          a[key] > b[key] ? Math.pow(-1, num) : Math.pow(-1, num + 1)
        );
    });
    setTimeout(() => {
      this.addEggs();
      this.displayPokemons();
      console.log(this.pokemons);
    }, 7000);
  }

  addEggs() {
    this.pokemons.forEach(pokemon => {
      this.pokeapiService.getPokemonSpecies(pokemon['id']).subscribe(res => {
        let eggs = [];
        res['egg_groups'].forEach(egg => {
          eggs.push(egg['name']);
        });
        pokemon['eggs'] = eggs;
      });
    });
  }

  displayPokemons() {
    if (this.pokemons.length === 0) {
      this.err = true;
    }
    this.maxPage = Math.ceil(this.pokemons.length / 12);
    this.maxValue = this.pokemons.length - 1;
    this.currentPokemons = this.pokemons.slice(
      this.currentBottom,
      this.currentTop
    );
    console.log(this.currentPokemons);
    this.loading = false;
    if (this.pokemons.length !== 0) {
      this.err = false;
    }
  }

  goToSorted(textValue: string) {
    this.loading = true;
    if (textValue === 'next') {
      this.currentBottom += 12;
      this.currentTop += 12;
    } else if (textValue === 'previous') {
      this.currentBottom -= 12;
      this.currentTop -= 12;
    } else if (textValue === 'first') {
      this.currentBottom = 0;
      this.currentTop = 12;
    } else if (textValue === 'last') {
      this.currentBottom = 12 * (this.maxPage - 1);
      this.currentTop = this.currentBottom + 12;
    }
    if (this.currentBottom < 0 || this.currentTop < 12) {
      this.currentBottom = 0;
      this.currentTop = 12;
    }
    if (
      this.currentTop > this.maxValue ||
      this.currentBottom > 12 * (this.maxPage - 1)
    ) {
      this.currentBottom = 12 * (this.maxPage - 1);
      this.currentTop = this.currentBottom + 12;
    }
    this.displayPokemons();
  }

  getFilters() {
    let x = document.querySelectorAll('.marked');
    let types: string[] = [];
    let eggs: string[] = [];
    x.forEach(element => {
      let type = element.id.split('/')[5];
      if (type === 'type') {
        types.push(element.innerHTML);
      } else {
        eggs.push(element.innerHTML);
      }
    });
    return [types, eggs];
  }

  displayFiltered() {
    this.loading = true;
    let arr = this.getFilters();
    let types: string[] = arr[0];
    let eggs: string[] = arr[1];
    if (types.length === 0 && eggs.length === 0) {
      this.initialPokemonsLoad(this.defaultUrl);
      return 0;
    }
    // podzielic tu funkcje zeby po kliknieciu na ikonke typu mozna bylo tu dolaczyc i przefiltrowac po ikonce
    this.currentPokemons = [];
    this.pokemons = [];
    this.nameSorted(2, 'id');
    this.sorting = true;
    const newList = [];
    setTimeout(() => {
      for (let i = 0; i < 807; i++) {
        let pokeType = this.pokemons[i].type;
        let pokeEgg = this.pokemons[i].eggs;
        if (types.length === 0) {
          if (eggs.some(x => pokeEgg.includes(x))) {
            newList.push(this.pokemons[i]);
          }
        } else if (eggs.length === 0) {
          if (types.some(x => pokeType.includes(x))) {
            newList.push(this.pokemons[i]);
          }
        } else {
          if (
            types.some(x => pokeType.indexOf(x) >= 0) &&
            eggs.some(x => pokeEgg.indexOf(x) >= 0)
          ) {
            newList.push(this.pokemons[i]);
          }
        }
      }
      this.pokemons = newList;
    }, 7800);
    setTimeout(() => {
      console.log(this.pokemons);
    }, 7800);
    setTimeout(() => {
      this.displayPokemons();
    }, 8500);
    if (this.pokemons.length !== 0) {
      this.err = false;
    }
  }
}
