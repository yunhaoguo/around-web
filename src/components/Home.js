import React from 'react';
import { Tabs, Button, Spin, Row, Col } from 'antd';
import { GEO_OPTIONS, POS_KEY, API_ROOT, TOKEN_KEY, AUTH_HEADER } from "../constants";
import { Gallery } from "./Gallery";
import { CreatePostButton } from "./CreatePostButton";
import { AroundMap } from './AroundMap';

const TabPane = Tabs.TabPane;

export class Home extends React.Component {

    state = {
        isLoadingGeoLocation: false,
        error: '',
        isLoadingPosts: false,
        posts: [],
        topic: 'around',
    }


    componentDidMount() {
        if ('geolocation' in navigator) {
            this.setState({
                isLoadingGeoLocation: true,
                error: ''
            })
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS,
            );
        } else {
            this.setState({error: 'Geolocation is not supported.'})
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        const { longitude, latitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({
            lat: latitude,
            lon: longitude
        }));
        this.setState({
            isLoadingGeoLocation: false,
            error: ''
        });
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = (error) => {
        this.setState({
            isLoadingGeoLocation: false,
            error: 'Failed to load location.'}
            );
    }

    loadNearbyPosts = () => {
        const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({ isLoadingPosts: true, error: '' });
        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20000`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`,
            },
        }).then((response) => {
            if (response.ok) {
                console.log(response);
                return response.json();
            }
            throw new Error('Failed to load posts.');
        }).then((data) => {
            console.log(data);
            this.setState({ isLoadingPosts: false, posts: data ? data : [] });
        }).catch((e) => {
            console.log(e.message);
            this.setState({ isLoadingPosts: false, error: e.message });
        });

    }

    getPanelContent = (type) => {
        const {error, isLoadingGeoLocation, isLoadingPosts, posts} = this.state;
        if (error) {
            return <div>{error}</div>;
        } else if (isLoadingGeoLocation) {
            return <Spin tip='Loading location...'/>;
        } else if (isLoadingPosts) {
            return <Spin tip='Loading posts...'/>;
        } else if (posts && posts.length > 0) {
            return type === "image" ? this.getImagePosts() : this.getVideoPosts();
        } else {
            return <div>No nearby posts.</div>
        }
    }

    getImagePosts = () => {
        const images = this.state.posts
            .filter(({type}) => type === 'image')
            .map((post) => {
            return {
                user: post.user,
                src: post.url,
                thumbnail: post.url,
                caption: post.message,
                thumbnailWidth: 400,
                thumbnailHeight: 300,
            }
        });

        return (<Gallery images={images}/>);
    }
    getVideoPosts = () => {

        return (
            <Row>
                {
                    this.state.posts
                        .filter(({type}) => type === "video")
                        .map((post) => (
                            <Col span={6}>
                                <video src={post.url} controls className='video-block'/>
                                <p>{`${post.user}: ${post.message}`}</p>
                            </Col>
                        ))
                }
            </Row>
        );
    }

    loadFacesAroundTheWorld = () => {
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({ isLoadingPosts: true, error: '' });
        fetch(`${API_ROOT}/cluster?term=face`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`,
            },
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
            .then((data) => {
                console.log(data);
                this.setState({ isLoadingPosts: false, posts: data ? data : [] });
            })
            .catch((e) => {
                console.log(e);
                this.setState({ isLoadingPosts: false, error: 'Loading face images failed.'});
            });
    }


    render() {
        const operations = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;
        return (
            <Tabs className="main-tabs" tabBarExtraContent={operations}>
                <TabPane tab="Image Posts" key="1">
                    {this.getPanelContent("image")}
                </TabPane>
                <TabPane tab="Video Posts" key="2">
                    {this.getPanelContent("video")}
                </TabPane>
                <TabPane tab="Map" key="3">
                    <AroundMap
                        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyD3CEh9DXuyjozqptVB5LA-dN7MxWWkr9s&v=3.exp&libraries=geometry,drawing,places"
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `800px` }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                        posts={this.state.posts}
                        loadNearbyPosts={this.loadNearbyPosts}
                        loadFacesAroundTheWorld={this.loadFacesAroundTheWorld}
                        topic={this.state.topic}
                    />
                </TabPane>
            </Tabs>
        );
    }
}



