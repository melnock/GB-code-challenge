import { useEffect, useState } from "react";
import { fetchAllPokemon, fetchPokemonDetailsByName, fetchEvolutionChainById, fetchPokemonSpeciesByName } from "./api";

function App() {
    const [pokemonIndex, setPokemonIndex] = useState([])
    const [pokemon, setPokemon] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [pokemonDetails, setPokemonDetails] = useState()

    useEffect(() => {
        const fetchPokemon = async () => {
            const {results: pokemonList} = await fetchAllPokemon()

            setPokemon(pokemonList)
            setPokemonIndex(pokemonList)
        }

        fetchPokemon().then(() => {
            /** noop **/
        })
    }, [])

    const onSearchValueChange = (event) => {
        const value = event.target.value
        setSearchValue(value)
        setPokemon(
            pokemonIndex.filter(monster => monster.name.includes(value))
        )
    }

    const onGetDetails = async (name) => {
      const pokemonSpecies = await fetchPokemonSpeciesByName(name)
      const pokemonDetails = await fetchPokemonDetailsByName(name)
      // to distill down to the chain id for the specific pokemon selected
      // (and not modify the api request),
      // must extract the id from the evolution chain url
      const chainId = pokemonSpecies.evolution_chain.url
        .split('/evolution-chain/')[1].split('/')[0]
      const pokemonEvolutions = await fetchEvolutionChainById(chainId)
      // store only the information needed
      setPokemonDetails({
        moves: pokemonDetails.moves,
        types: pokemonDetails.types,
        chain: pokemonEvolutions.chain
      })
    }

    const buildPokemonEvolutionChain = () => {
      if (pokemonDetails?.chain) {
        const {chain} = pokemonDetails
        const evolutionArray = [<span>{chain.species.name}</span>]
        // this method will recursively add the evolutions to the evolutionArray
        retrieveEvolutionInfo(chain, evolutionArray)
        return evolutionArray
      }
      return []
    }

    const retrieveEvolutionInfo = (chain, evolutionArray) => {
      if (chain.evolves_to.length) {
        evolutionArray.push(<span>{chain.evolves_to[0].species.name}</span>)
        retrieveEvolutionInfo(chain.evolves_to[0], evolutionArray)
      }
    }

    return (
      <div className={'pokedex__container'}>
        <div className={'pokedex__search-input'}>
          <input value={searchValue} onChange={onSearchValueChange} placeholder={'Search Pokemon'}/>
        </div>
        <div className={'pokedex__content'}>
          {pokemon.length > 0 ? (
            <div className={'pokedex__search-results'}>
              {
                pokemon.map(monster => {
                    return (
                      <div className={'pokedex__list-item'} key={monster.name}>
                        <div>
                          {monster.name}
                        </div>
                        <button
                         type='button'
                         aria-label={`get-details-${monster.name}`}
                         onClick={() => onGetDetails(monster.name)}
                         >
                          Get Details
                        </button>
                      </div>
                    )
                })
              }
            </div>
          ) :
          (
            <h3 className='no-results'>
              No Results Found
            </h3>
          )
        }
          {
            pokemonDetails && (
              <div className={'pokedex__details'}>
                  <h2>{pokemonDetails.name}</h2>
                  <div className='pokemon-stats'>
                    <div className='types'>
                      <h2>Types</h2>
                      <ul>
                        {pokemonDetails.types
                          .map(type => <li key={type.type.name}>{type.type.name}</li>)
                        }
                      </ul>
                    </div>
                    <div className='moves'>
                      <h2>Moves</h2>
                      <ul>
                        {pokemonDetails.moves
                          .slice(0,4)
                          .map(move => <li key={move.move.name}>{move.move.name}</li>)
                        }
                      </ul>
                    </div>
                  </div>
                  <div className='pokemon-evolution'>
                    <h2>Evolutions</h2>
                    <div>
                      {buildPokemonEvolutionChain()}
                    </div>
                  </div>
              </div>
            )
          }
        </div>
      </div>
    );
}

export default App;
