import { Component, OnInit } from '@angular/core';
import { PokeapiService } from '../_services/pokeapi.service';
import { HttpClient } from '@angular/common/http';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
import { cloneDeep } from 'lodash';

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
  // public pokemonCount: number;
  public pokemons: any[];
  public currentPokemons: any[] = [];
  public next: string;
  public first: string = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=12';
  public previous: string;
  public currentUrl: string;
  public last: string =
    'https://pokeapi.co/api/v2/pokemon?offset=800&limit=12"';
  public loading: boolean = false;
  public eggs: object[] = [];
  public noResults: boolean = false;

  constructor(
    private pokeapiService: PokeapiService,
    private http: HttpClient
  ) {}

  public defaultUrl: string = `${this.pokeapiService.urlTemplate}pokemon/?limit=12&offset=0`;

  ngOnInit() {
    // this.loadPokemons('https://pokeapi.co/api/v2/pokemon/?limit=12&offset=0');
    this.initialPokemonsLoad(this.defaultUrl);
  }

  loadPokemons(url: string) {
    this.loading = true;
    console.log(this.loading);
    this.currentPokemons = [];
    this.pokeapiService.getPokemons(url).subscribe(val => {
      this.pokemons = val['results'];
      // this.pokemonCount = val['count'];
      this.previous = val['previous'];
      this.next = val['next'];
      console.log(this.next);
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

  initialPokemonsLoad(url: string) {
    this.loading = true;
    this.currentPokemons = [];
    this.pokeapiService.getPokemons(url).subscribe(val => {
      this.pokemons = val['results'];
      // this.pokemonCount = val['count'];
      this.previous = val['previous'];
      this.next = val['next'];

      if (this.next >= this.last) {
        this.next = this.last;
        this.pokemons = this.pokemons.slice(0, 7);
      }
      this.pokemons.forEach(el => {
        this.http.get(el['url']).subscribe(res => {
          ///////////////////////////
          this.createPokemonCard(res);
          // let types = [];
          // res['types'].forEach(element => {
          //   let el = element.type.name;
          //   types.push(el);
          // });
          // let num = this.threeDigitNumber(res['id']);
          // let photo = `http://assets.pokemon.com/assets/cms2/img/pokedex/detail/${num}.png`;
          // let set = new View(res['name'], num, res['id'], photo, types);
          // this.currentPokemons.push(set);
          /////////////////////////
        });
      });
    });
    this.loading = false;
  }

  getphoto(num: string) {
    return `http://assets.pokemon.com/assets/cms2/img/pokedex/detail/${num}.png`;
  }

  createPokemonCard(pokemon: object) {
    // dla endpointu np:  .../pokmon/1/
    let types = [];
    pokemon['types'].forEach(element => {
      types.push(element.type.name);
    });
    let num = this.threeDigitNumber(pokemon['id']);
    let photo = this.getphoto(num);
    let set = new View(pokemon['name'], num, pokemon['id'], photo, types);
    this.currentPokemons.push(set);
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
    // this.loadPokemons(url);
    this.initialPokemonsLoad(url);
  }

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

  searchPokemon(urlValue: string) {
    this.currentPokemons = [];
    this.pokeapiService.getPokemon(urlValue).subscribe(
      res => {
        this.createPokemonCard(res);
      },
      err => console.log(err)
    );
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
