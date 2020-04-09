import { Component, OnInit } from '@angular/core';
import { PokeapiService } from '../_services/pokeapi.service';
import { Observable } from 'rxjs';
import { IPokemonInfo } from '../_interfaces/IPokemonInfo';

class View {
  img: string;
  name: string;
  id: string;
  type: any[];

  constructor(name: string, id: string, img: string, type: any[]) {
    this.name = name;
    this.id = id;
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
  public pokemonCount;
  public pokemons;
  public x;
  public currentPokemons: any[] = [];
  public currentTop = 12;
  public currentBottom = 0;

  constructor(private pokeapiService: PokeapiService) {}

  ngOnInit() {
    // this.loadPokemons();
    this.loadSets();
  }

  // loadPokemons() {
  //   this.x = this.pokeapiService.getPokemons().subscribe(val => {
  //     this.pokemons = val['results'];
  //     this.pokemonCount = val['count'];
  //     console.log(this.pokemons);
  //     console.log(this.pokemonCount);
  //     console.log(val);
  //   });
  // }

  threeDigitNumber(num) {
    let n = num.toString();
    n = n.padStart(3, '0');
    return n;
  }

  loadSets() {
    for (let i = this.currentBottom; i < this.currentTop; i++) {
      let num = this.threeDigitNumber(i + 1);
      this.pokeapiService.getPokemon(i + 1).subscribe(res => {
        // console.log(res);
        let types = [];
        res['types'].forEach(element => {
          let el = element.type.name;
          types.push(el);
        });
        let photo = `http://assets.pokemon.com/assets/cms2/img/pokedex/detail/${num}.png`;
        let set = new View(res['name'], num, photo, types);
        this.currentPokemons.push(set);
      });
    }
  }

  sortBy(prop: string) {
    return this.currentPokemons.sort((a, b) =>
      a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1
    );
  }
}
