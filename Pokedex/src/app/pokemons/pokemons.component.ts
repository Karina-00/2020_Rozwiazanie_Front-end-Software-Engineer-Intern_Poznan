import { Component, OnInit } from '@angular/core';
import { PokeapiService } from '../_services/pokeapi.service';
import { HttpClient } from '@angular/common/http';

class View {
  img: string;
  name: string;
  id: string;
  num: number;
  type: string[];

  constructor(
    name: string,
    id: string,
    num: number,
    img: string,
    type: string[]
  ) {
    this.name = name;
    this.id = id;
    this.num = num;
    this.img = img;
    this.type = type;
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
  first = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=12';
  previous: string;
  last = 'https://pokeapi.co/api/v2/pokemon?offset=800&limit=12"';
  loading = false;
  err = false;
  sorting = false;
  currentTop = 12;
  currentBottom = 0;
  maxValue: number;
  maxPage: number;

  constructor(
    private pokeapiService: PokeapiService,
    private http: HttpClient
  ) {}

  defaultUrl = `${this.pokeapiService.urlTemplate}pokemon/?limit=12&offset=0`;

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
    const types = [];
    pokemon['types'].forEach(element => {
      types.push(element.type.name);
    });
    const num = this.threeDigitNumber(pokemon['id']);
    const photo = this.pokeapiService.getphoto(num);
    const set = new View(pokemon['name'], num, pokemon['id'], photo, types);
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
    this.sorting = false;
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
    if (!this.sorting) {
      this.pokemons = [];
      this.currentPokemons = [];
    }
    this.currentBottom = 0;
    this.currentTop = 12;
    if (val === 'nameAsc') {
      this.nameSorted(2, 'name');
    } else if (val === 'nameDesc') {
      this.nameSorted(1, 'name');
    } else if (val === 'indexAsc') {
      if (this.sorting) {
        this.nameSorted(2, 'id');
      } else {
        this.initialPokemonsLoad(this.defaultUrl);
      }
    } else {
      this.nameSorted(1, 'id');
    }
  }

  nameSorted(num: number, key: string) {
    if (!this.sorting) {
      const promises = [];
      for (let i = 1; i <= 807; i++) {
        const url = `${this.pokeapiService.urlTemplate}pokemon/${i}`;
        promises.push(fetch(url).then(res => res.json()));
      }
      Promise.all(promises)
        .then(results => {
          this.pokemons = results
            .map(result => ({
              img: this.pokeapiService.getphoto(
                this.threeDigitNumber(result.id)
              ),
              name: result.name,
              id: result.id,
              num: this.threeDigitNumber(result.id),
              type: result.types.map(type => type.type.name),
            }))
            .sort((a, b) =>
              a[key] > b[key] ? Math.pow(-1, num) : Math.pow(-1, num + 1)
            );
        })
        .then(() => {
          this.sorting = true;
          this.displayPokemons();
        });
    } else {
      Promise.all(this.pokemons)
        .then(() => {
          this.pokemons.sort((a, b) =>
            a[key] > b[key] ? Math.pow(-1, num) : Math.pow(-1, num + 1)
          );
        })
        .then(() => this.displayPokemons());
    }
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

  applyFilters(types, letters) {
    const promises = [];
    for (let i = 1; i <= 807; i++) {
      const url = `${this.pokeapiService.urlTemplate}pokemon/${i}`;
      promises.push(fetch(url).then(res => res.json()));
    }
    Promise.all(promises)
      .then(results => {
        this.pokemons = results
          .map(result => ({
            img: this.pokeapiService.getphoto(this.threeDigitNumber(result.id)),
            name: result.name,
            id: result.id,
            num: this.threeDigitNumber(result.id),
            type: result.types.map(type => type.type.name),
            letter: result.name[0],
          }))
          .filter(pokemon => {
            if (types.length === 0) {
              return letters.includes(pokemon.letter);
            } else if (letters.length === 0) {
              return types.some(x => pokemon.type.includes(x));
            } else {
              return (
                types.some(x => pokemon.type.includes(x)) &&
                letters.includes(pokemon.letter)
              );
            }
          });
      })
      .then(() => {
        console.log(this.pokemons);
        this.currentBottom = 0;
        this.currentTop = 12;
        this.displayPokemons();
      });
  }

  getFilters() {
    const marked = document.querySelectorAll('.marked');
    const types: string[] = [];
    const letters: string[] = [];
    marked.forEach(element => {
      const type = element.id.split('/')[5];
      if (type === 'type') {
        types.push(element.innerHTML);
      } else {
        letters.push(element.innerHTML.toLowerCase());
      }
    });
    return [types, letters];
  }

  displayFiltered() {
    this.loading = true;
    const arr = this.getFilters();
    const types: string[] = arr[0];
    const letters: string[] = arr[1];
    if (types.length === 0 && letters.length === 0) {
      this.initialPokemonsLoad(this.defaultUrl);
      return 0;
    }
    this.sorting = true;
    this.currentPokemons = [];
    this.pokemons = [];
    this.applyFilters(types, letters);
  }
}
