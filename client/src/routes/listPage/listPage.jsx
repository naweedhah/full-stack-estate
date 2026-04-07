import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Map from "../../components/map/Map";
import { Await, useLoaderData } from "react-router-dom";
import { Suspense } from "react";

function ListPage() {
  const data = useLoaderData();

  return (
    <div className="listPage">
      <div className="listContainer">
        <div className="wrapper">
          <Filter />
          <Suspense fallback={<p>Loading demand overview...</p>}>
            <Await
              resolve={data.demandResponse}
              errorElement={<p>Failed to load demand overview.</p>}
            >
              {(demandResponse) => (
                <section className="demandSection">
                  <div className="demandHeader">
                    <div>
                      <p className="eyebrow">Demand Heatmap</p>
                      <h2>High and Low Demand Areas</h2>
                    </div>
                    <div className="demandLegend">
                      <span className="legendItem high">High demand</span>
                      <span className="legendItem medium">Medium demand</span>
                      <span className="legendItem low">Low demand</span>
                    </div>
                  </div>

                  <div className="demandGrid">
                    <article className="demandCard highCard">
                      <h3>High Demand Areas</h3>
                      {demandResponse.data.highDemandAreas.length > 0 ? (
                        <div className="demandList">
                          {demandResponse.data.highDemandAreas.map((area) => (
                            <div className="demandRow" key={area.key}>
                              <div>
                                <strong>{area.area}</strong>
                                <span>{area.city}</span>
                              </div>
                              <p>
                                Score {area.demandScore}
                                <small>
                                  {area.searches} searches • {area.inquiries} inquiries • {area.bookings} bookings
                                </small>
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="emptyDemand">No high demand areas detected yet.</p>
                      )}
                    </article>

                    <article className="demandCard lowCard">
                      <h3>Low Demand Areas</h3>
                      {demandResponse.data.lowDemandAreas.length > 0 ? (
                        <div className="demandList">
                          {demandResponse.data.lowDemandAreas.map((area) => (
                            <div className="demandRow" key={area.key}>
                              <div>
                                <strong>{area.area}</strong>
                                <span>{area.city}</span>
                              </div>
                              <p>
                                Score {area.demandScore}
                                <small>
                                  {area.searches} searches • {area.inquiries} inquiries • {area.bookings} bookings
                                </small>
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="emptyDemand">No low demand areas detected yet.</p>
                      )}
                    </article>
                  </div>
                </section>
              )}
            </Await>
          </Suspense>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) =>
                postResponse.data.map((post) => (
                  <Card key={post.id} item={post} />
                ))
              }
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="mapContainer">
        <Suspense fallback={<p>Loading map...</p>}>
          <Await
            resolve={data.postResponse}
            errorElement={<p>Unable to load the map listings.</p>}
          >
            {(postResponse) => (
              <Suspense
                fallback={<Map items={postResponse.data} demandAreas={[]} />}
              >
                <Await
                  resolve={data.demandResponse}
                  errorElement={<Map items={postResponse.data} demandAreas={[]} />}
                >
                  {(demandResponse) => (
                    <Map
                      items={postResponse.data}
                      demandAreas={demandResponse.data.allAreas}
                    />
                  )}
                </Await>
              </Suspense>
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export default ListPage;
