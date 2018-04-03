import React, { Component } from 'react'
import extend from 'lodash/extend'
import map from 'lodash/map'
import { SearchkitManager,SearchkitProvider,
  SearchBox, RefinementListFilter, Pagination,
  HierarchicalMenuFilter, HitsStats, SortingSelector, NoHits,
  ResetFilters, RangeFilter, NumericRefinementListFilter,
  ViewSwitcherHits, ViewSwitcherToggle, DynamicRangeFilter,
  InputFilter, GroupedSelectedFilters,
  Layout, TopBar, LayoutBody, LayoutResults,
  ActionBar, ActionBarRow, SideBar } from 'searchkit'
import './index.css'

//const host = "http://demo.searchkit.co/api/movies"
const host = "http://13.59.100.103:9200/artist"
const searchkit = new SearchkitManager(host)

const MovieHitsGridItem = (props)=> {
  const {bemBlocks, result} = props
  let url = "" + result._source.url
  console.log(url);
  const source = extend({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="poster" alt="presentation" className={bemBlocks.item("poster")} src={result._source.poster} width="170" height="240"/>
        <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.artTitle}}></div>
      </a>
    </div>
  )
}

const MovieHitsListItem = (props)=> {
  const {bemBlocks, result} = props
  let url = "http://www.imdb.com/title/" + result._source.imdbId
  const source = extend({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("poster")}>
        <img alt="presentation" data-qa="poster" src={result._source.poster}/>
      </div>
      <div className={bemBlocks.item("details")}>
        <a href={url} target="_blank"><h2 className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.artTitle}}></h2></a>
        <h3 className={bemBlocks.item("subtitle")}>Created in {source.artYear}, Price: {source.Price}</h3>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source.about}}></div>
        <h3 className={bemBlocks.item("subtitle")}>Dimesions: {source.Size}</h3>
      </div>
    </div>
  )
}

const MovieHitsTable = (props)=> {  
  const { hits } = props
  return (
    <div style={{width: '100%', boxSizing: 'border-box', padding: 8}}>
      <table className="sk-table sk-table-striped" style={{width: '100%', boxSizing: 'border-box'}}>
        <thead>
          <tr>
            <th></th> <th>Title</th> <th>Year Published</th> <th>Gallery</th>
          </tr>
        </thead>
        <tbody>
        {map(hits, hit => (
          <tr key={hit._id}>
            <td style={{margin: 0, padding: 0, width: 40}}>
              <img data-qa="poster" src={hit._source.poster} style={{width: 40}}/>
            </td>
            <td>{hit._source.artTitle}</td>
            <td>{hit._source.artYear}</td>
            <td>{hit._source.owner}</td>
          </tr>
          ))}
          </tbody>
      </table>
    </div>
    )  
}


class App extends Component {
  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <TopBar>
            <div className="my-logo"><b>EPHEMEREYE</b></div>
            <SearchBox autofocus={true} searchOnChange={true} prefixQueryFields={["actors^1","Technology^2","Medium","name^10"]}/>
          </TopBar>

        <LayoutBody>

          <SideBar>
            <HierarchicalMenuFilter fields={["type.raw", "genres.raw"]} title="Categories" id="categories"/>
            <DynamicRangeFilter field="metaScore" id="metascore" title="Metascore" rangeFormatter={(count)=> count + "*"}/>
            <InputFilter id="writers" searchThrottleTime={500} title="Artists" placeholder="Search artists" searchOnChange={true} queryFields={["about"]} />
            <RangeFilter min={1900} max={2017} field="artYear" id="imdbRating" title="Art Timeline" showHistogram={true}/>
            <DynamicRangeFilter field="dob" id="payrate" title="Artist Timeline" rangeFormatter={(count)=> count + "*"}/>
            <RefinementListFilter id="actors" title="Artists" field="name.keyword" size={10}/>
            <RefinementListFilter id="writersFacets" translations={{"facets.view_more":"View more writers"}} title="Art Category" field="Movement.keyword" operator="AND" size={10}/>
            <RefinementListFilter id="gallery" title="Gallery" field="owner.keyword" size={10}/>
            <RefinementListFilter id="countries" title="Nationality" field="Nationality.keyword" operator="OR" size={10}/>
            <NumericRefinementListFilter id="runtimeMinutes" title="Length" field="runtimeMinutes" options={[
              {title:"All"},
              {title:"up to 20", from:0, to:20},
              {title:"21 to 60", from:21, to:60},
              {title:"60 or more", from:61, to:1000}
            ]}/>
          </SideBar>
          <LayoutResults>
            <ActionBar>

              <ActionBarRow>
                <HitsStats translations={{
                  "hitstats.results_found":"{hitCount} results found"
                }}/>
                <ViewSwitcherToggle/>
                <SortingSelector options={[
                  {label:"Relevance", field:"_score", order:"desc"},
                  {label:"Latest", field:"artYear", order:"desc"},
                  {label:"Earliest", field:"artYear", order:"asc"}
                ]}/>
              </ActionBarRow>

              <ActionBarRow>
                <GroupedSelectedFilters/>
                <ResetFilters/>
              </ActionBarRow>

            </ActionBar>
            <ViewSwitcherHits
                hitsPerPage={12} highlightFields={["name","plot"]}
              //  sourceFilter={["about", "name", "poster", "artistId", "dob", "year"]}
                hitComponents={[
                  {key:"grid", title:"Grid", itemComponent:MovieHitsGridItem, defaultOption:true},
                  {key:"list", title:"List", itemComponent:MovieHitsListItem},
                  {key:"table", title:"Table", listComponent:MovieHitsTable}
                ]}
                scrollTo="body"
            />
            <NoHits suggestionsField={"name"}/>
            <Pagination showNumbers={true}/>
          </LayoutResults>

          </LayoutBody>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default App;
