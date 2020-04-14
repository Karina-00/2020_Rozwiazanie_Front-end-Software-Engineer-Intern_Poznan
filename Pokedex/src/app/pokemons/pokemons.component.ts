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
    if (val === 'nameAsc') {
      this.nameSorted(2, 'name');
    } else if (val === 'nameDesc') {
      this.nameSorted(1, 'name');
    } else if (val === 'indexAsc') {
      console.log('l');
      this.initialPokemonsLoad(this.defaultUrl);
    } else {
      this.nameSorted(1, 'id');
    }
  }

  nameSorted(num: number, key: string) {
    this.loading = true;
    this.pokemons = [];
    this.currentPokemons = [];
    this.currentBottom = 0;
    this.currentTop = 12;
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
      console.log(this.pokemons);
    });
    setTimeout(() => {
      this.displayPokemons();
    }, 5000);
  }

  displayPokemons() {
    this.currentPokemons = this.pokemons.slice(
      this.currentBottom,
      this.currentTop
    );
    console.log(this.currentPokemons);
    this.loading = false;
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
      this.currentBottom += 804;
      this.currentTop += 807;
    }
    if (this.currentBottom < 0 || this.currentTop < 12) {
      this.currentBottom = 0;
      this.currentTop = 12;
    }
    if (this.currentTop > 807 || this.currentBottom > 804) {
      this.currentTop = 807;
      this.currentBottom = 804;
    }
    this.displayPokemons();
  }
  /////////////////////////////////////////////

  getByEggs(url: string) {
    let list = [];
    this.http.get(url).subscribe(response => {
      let pokemons: any[] = [];
      pokemons = response['pokemon_species'];
      pokemons.forEach(el => {
        let eggs = [];
        this.http.get(el['url']).subscribe(pok => {
          pok['egg_groups'].forEach(egg => {
            eggs.push(egg.name);
          });
          // console.log('eggtypes: ', eggs);
          // console.log(pok['varieties'][0]['pokemon']['url']);
          this.http
            .get(pok['varieties'][0]['pokemon']['url'])
            .subscribe(res => {
              //powtoreczka tego co w funkcji wyzej
              let types = [];
              res['types'].forEach(element => {
                let el = element.type.name;
                types.push(el);
              });
              let num = this.threeDigitNumber(res['id']);
              let photo = `http://assets.pokemon.com/assets/cms2/img/pokedex/detail/${num}.png`;
              let set = new View(
                res['name'],
                num,
                res['id'],
                photo,
                types,
                eggs
              );
              list.push(set);
            });
        });
      });
    });
    console.log(list);
    return list;
  }

  displayFiltered() {
    this.currentPokemons = [];
    this.pokemons = [];
    let x = document.querySelectorAll('.marked');
    console.log(x);
    //dla typow
    x.forEach(el => {
      let url = el.getAttribute('id');
      this.http.get(url).subscribe(res => {
        let name = res['name'];
        console.log(name);
        res['pokemon'].forEach(pok => {
          this.pokemons.push(pok['pokemon']['name']);
        });
      });
      console.log(this.pokemons);
    });
    setTimeout(() => {
      let arr = new Set(this.pokemons);
      console.log(arr);
      console.log(this.pokemons.length);
    }, 1000);

    // const fs = require('fs');
    // let arr = [];
    // let eggs: object[] = [];
    // // let eggs = new Set(arr);
    // let types = new Set(arr);
    // let colors = new Set(arr);
    // let ad: object[] = [];
    // let notvisited = true;
    // pairs.forEach(pair => {
    //   if (pair[1] === 'egg-group') {
    //     setTimeout(() => {
    //       ad = this.getByEggs(pair[0]);

    //       console.log(ad);
    //       if (notvisited) {
    //         console.log('weszlo');
    //         notvisited = false;
    //       } else {
    //         console.log(ad);
    //         for (let i = 0; i < this.eggs.length; i++) {
    //           for (let j = 0; j < ad.length; j++) {
    //             console.log(this.eggs[i]['num']);
    //             if (this.eggs[i]['num'] === ad[j]['num']) {
    //               arr.push(eggs[i]);
    //             }
    //           }
    //         }
    //         this.eggs = [...this.eggs, ...ad];
    //         console.log(arr);
    //       }
    //     }, 3000);
    // ad = this.getByEggs(pair[0]);

    // console.log(ad);
    // if (notvisited) {
    //   console.log('weszlo');
    //   notvisited = false;
    // } else {

    //     console.log(ad);
    //     for (let i = 0; i < this.eggs.length; i++) {
    //       for (let j = 0; j < ad.length; j++) {
    //         console.log(this.eggs[i]['num']);
    //         if (this.eggs[i]['num'] === ad[j]['num']) {
    //           arr.push(eggs[i]);
    //         }
    //       }
    //     }
    //     this.eggs = [...this.eggs, ...ad];
    //     console.log(arr);

    // console.log(this.eggs[0]);
    // let arr = new Set([]);

    // console.log(this.eggs[0]);
    // // let arr = new Set([]);
    // for (let i = 0; i < this.eggs.length; i++) {
    //   for (let j = 0; j < ad.length; j++) {
    //     console.log(this.eggs[i]['num']);
    //     if (this.eggs[i]['num'] === ad[j]['num']) {
    //       arr.push(eggs[i]);
    //     }
    //   }
    // }
    // this.eggs = [...this.eggs, ...ad];
    // }
    // console.log('eggs', this.eggs);
    // });
    //  else if (pair[1] === 'type') {
    //   types.add(pair[0]);
    // } else {
    //   colors.add(pair[0]);
    // }
    // });
    // console.log(this.eggs);
    //rozroznyc egg type, color, type po nadawanych roznych kolorach
  }
}
